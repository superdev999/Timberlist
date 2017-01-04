from django.db.models import Q
from operator import __or__ as OR
from django.contrib.gis.geos import GEOSGeometry, Polygon
from django.contrib.gis.measure import D
from django.contrib.gis.db.models.functions import Distance
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import detail_route, parser_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from timberlistapp.serializers import *
from timberlistapp.models import *
from timberlistapp.permissions import *
import json
from distutils.util import strtobool


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [
        IsSelf
    ]

    @detail_route(methods=['PUT'], permission_classes=[IsSelf])
    @parser_classes((FormParser, MultiPartParser,))
    def image(self, request, *args, **kwargs):
        if 'file' in request.data:
            user_profile = self.get_object().profile
            user_profile.photo.delete()

            photo = request.data['file']

            user_profile.photo.save(str(user_profile.id)+".png", photo)

            return Response(status=HTTP_201_CREATED, headers={'Location': user_profile.photo.url})
        else:
            return Response(status=HTTP_400_BAD_REQUEST)


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [
        IsOwnerOrReadOnly
    ]

    def get_queryset(self):

        queryset = UserProfile.objects.all()
        mill = self.request.query_params.get('enable_mills')
        buyer = self.request.query_params.get('enable_buyers')
        consultant = self.request.query_params.get('enable_consultants')
        bounds = self.request.query_params.get('bounds', None)
        listing_id = self.request.query_params.get('from_listing_id', None)
        distance = self.request.query_params.get('distance', None)

        if listing_id is not None and distance is not None:
            listing = Listing.objects.get(id=listing_id)
            queryset = queryset.filter(address__lat_long__distance_lte=(listing.tract.lat_long, D(mi=distance)))
            queryset = queryset.annotate(distance=Distance('address__lat_long', listing.tract.lat_long))
            queryset = queryset.order_by('distance')

        if bounds is not None:
            bounds = json.loads(bounds)
            bbox = Polygon.from_bbox((bounds['south'], bounds['west'], bounds['north'], bounds['east']))
            queryset = queryset.filter(address__lat_long__within=bbox)

        type_filters = []
        if mill is not None and strtobool(mill):
            type_filters.append(Q(mill=strtobool(mill)))
        if buyer is not None and strtobool(buyer):
            type_filters.append(Q(buyer=strtobool(buyer)))
        if consultant is not None and strtobool(consultant):
            type_filters.append(Q(consultant=strtobool(consultant)))
        if len(type_filters) > 0:
            queryset = queryset.filter(reduce(OR, type_filters))

        return queryset


class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [
        IsOwnerOrReadOnly
    ]


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [
        IsOwnerOrReadOnly
    ]


class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all().order_by('-when_added')
    serializer_class = ListingSerializer
    permission_classes = [
        IsOwnerOrReadOnly
    ]

    def get_queryset(self):
        queryset = Listing.objects.all()
        bounds = self.request.query_params.get('bounds', None)
        min_acres = self.request.query_params.get('min_acres', None)
        max_acres = self.request.query_params.get('max_acres', None)
        owner_id = self.request.query_params.get('owner_id', None)
        active = self.request.query_params.get('active', None)
        published = self.request.query_params.get('published', None)

        if bounds is not None:
            bounds = json.loads(bounds)
        if bounds is not None and 'south' in bounds:
            bbox = Polygon.from_bbox((bounds['south'], bounds['west'], bounds['north'], bounds['east']))
            queryset = queryset.filter(tract__lat_long__within=bbox)
        if min_acres is not None and min_acres != '' and float(min_acres) > 0:
            queryset = queryset.filter(tract__acreage__gte=min_acres)
        if max_acres is not None and max_acres != '' and float(max_acres) < 900000000:
            queryset = queryset.filter(tract__acreage__lte=max_acres)
        if owner_id is not None:
            queryset = queryset.filter(owner__owner__id=owner_id)
        if active is not None and active == 'true':
            queryset = queryset.filter(end_date__gte=timezone.now())
        if active is not None and active == 'false':
            queryset = queryset.filter(end_date__lt=timezone.now())
        if published == 'false' and owner_id is not None and int(owner_id) == self.request.user.id:
            queryset = queryset.filter(published=False)
        elif published is None and not self.request.user.is_anonymous():
            queryset = queryset.filter((Q(published=False) & Q(owner_id=self.request.user.profile.id)) | Q(published=True))
        else:
            queryset = queryset.filter(published=True)

        queryset = queryset.order_by('end_date', '-when_added')
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.profile)

    def perform_update(self, serializer):
        serializer.save(owner=self.request.user.profile)


class TractViewSet(viewsets.ModelViewSet):
    serializer_class = TractSerializer
    permission_classes = [
        IsOwnerOrReadOnly
    ]

    def get_queryset(self):
        return Tract.objects.all().filter(owner=self.request.user.profile).order_by('title')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.profile)

    def perform_update(self, serializer):
        serializer.save(owner=self.request.user.profile)


class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [
        IsOwnerOrReadOnly
    ]

# http://stackoverflow.com/questions/20473572/django-rest-framework-file-upload
# http://stackoverflow.com/questions/17280007/retrieving-a-foreign-key-value-with-django-rest-framework-serializers
class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [
        IsOwnerOrReadOnly
    ]

    def get_queryset(self):
        return File.objects.all().filter(owner=self.request.user.profile)

    def perform_create(self, serializer):
        if 'file' in self.request.data:
            file = serializer.save(
                owner=self.request.user.profile,
                listing=Listing.objects.get(id=self.request.data['listing_id'])
            )
            file.file.save(str(file.id)+'-'+self.request.data['filename'], self.request.data['file'])
        else:
            serializer.save(owner=self.request.user.profile)

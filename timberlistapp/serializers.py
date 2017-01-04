from django.contrib.auth.models import User, Group
from rest_framework import serializers
from rest_framework_gis.fields import GeometryField
from rest_auth.serializers import UserDetailsSerializer
from rest_auth.registration import (serializers as restauthserializers)
from timberlistapp.models import *
import logging

from allauth.account import app_settings as allauth_settings
from allauth.utils import (email_address_exists,
                           get_username_max_length)
from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email


class RegisterUserSerializer(serializers.Serializer):
    username = serializers.CharField(
        max_length=get_username_max_length(),
        min_length=allauth_settings.USERNAME_MIN_LENGTH,
        required=allauth_settings.USERNAME_REQUIRED
    )
    email = serializers.EmailField(required=allauth_settings.EMAIL_REQUIRED)
    password1 = serializers.CharField(required=True, write_only=True)
    password2 = serializers.CharField(required=True, write_only=True)

    def validate_username(self, username):
        username = get_adapter().clean_username(username)
        return username

    def validate_email(self, email):
        email = get_adapter().clean_email(email)
        if allauth_settings.UNIQUE_EMAIL:
            if email and email_address_exists(email):
                raise serializers.ValidationError(
                    "A user is already registered with this e-mail address.")
        return email

    def validate_password1(self, password):
        return get_adapter().clean_password(password)

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError("The two password fields didn't match.")
        return data

    def custom_signup(self, request, user):
        pass

    def get_cleaned_data(self):
        return {
            'username': self.validated_data.get('username', ''),
            'password1': self.validated_data.get('password1', ''),
            'email': self.validated_data.get('email', '')
        }

    def save(self, request):
        logger = logging.getLogger(__name__)
        logger.warn("In save")

        adapter = get_adapter()
        user = adapter.new_user(request)
        self.cleaned_data = self.get_cleaned_data()
        adapter.save_user(request, user, self)
        self.custom_signup(request, user)
        setup_user_email(request, user, [])

        profile = UserProfile(owner=user)
        profile.save()

        return user


class UserSerializer(UserDetailsSerializer):

    is_staff = serializers.BooleanField(read_only=True)
    buyer = serializers.NullBooleanField(source="profile.buyer")
    seller = serializers.NullBooleanField(source="profile.seller")
    consultant = serializers.NullBooleanField(source="profile.consultant")
    mill = serializers.NullBooleanField(source="profile.mill")
    company_name = serializers.CharField(source="profile.company_name", allow_blank=True, allow_null=True)
    phone = serializers.CharField(source="profile.phone", allow_blank=True, allow_null=True)
    fax = serializers.CharField(source="profile.fax", allow_blank=True, allow_null=True)
    cell = serializers.CharField(source="profile.cell", allow_blank=True, allow_null=True)
    photo = serializers.ImageField(source="profile.photo", use_url=True, read_only=True)
    description = serializers.CharField(source="profile.description", allow_blank=True, allow_null=True)
    address1 = serializers.CharField(source="profile.address.address1")
    address2 = serializers.CharField(source="profile.address.address2", allow_blank=True, allow_null=True)
    city = serializers.CharField(source="profile.address.city", allow_blank=True, allow_null=True)
    county = serializers.CharField(source="profile.address.county", allow_blank=True, allow_null=True)
    state = serializers.CharField(source="profile.address.state", allow_blank=True, allow_null=True)
    country = serializers.CharField(source="profile.address.country", allow_blank=True, allow_null=True)
    zipcode = serializers.CharField(source="profile.address.zipcode")
    lat_long = GeometryField(source="profile.address.lat_long")

    class Meta(UserDetailsSerializer.Meta):
        fields = UserDetailsSerializer.Meta.fields + (
            'is_staff', 'id', 'buyer', 'seller', 'consultant', 'mill', 'company_name', 'phone', 'fax', 'cell', 'description', "photo",
            'address1', 'address2', 'city', 'county', 'state', 'country', 'zipcode', 'lat_long'
        )
        read_only_fields = 'id', 'is_staff'

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})

        buyer = profile_data.get('buyer', False) or False
        seller = profile_data.get('seller', False) or False
        consultant = profile_data.get('consultant', False) or False
        mill = profile_data.get('mill', False) or False
        company_name = profile_data.get('company_name', '') or ''
        phone = profile_data.get('phone', '') or ''
        fax = profile_data.get('fax', '') or ''
        cell = profile_data.get('cell', '') or ''
        description = profile_data.get('description', '') or ''

        address1 = profile_data.get('address').get('address1') or ''
        address2 = profile_data.get('address').get('address2') or ''
        city = profile_data.get('address').get('city') or ''
        county = profile_data.get('address').get('county') or ''
        state = profile_data.get('address').get('state') or ''
        country = profile_data.get('address').get('country') or ''
        zipcode = profile_data.get('address').get('zipcode') or ''
        lat_long = profile_data.get('address').get('lat_long') or ''

        instance = super(UserSerializer, self).update(instance, validated_data)

        if hasattr(instance, 'profile'):
            profile = instance.profile
        else:
            profile = UserProfile(owner=instance)
            instance.profile = profile

        profile.buyer = buyer
        profile.seller = seller
        profile.consultant = consultant
        profile.mill = mill
        profile.company_name = company_name
        profile.phone = phone
        profile.fax = fax
        profile.cell = cell
        profile.description = description

        if hasattr(instance, 'address'):
            address = instance.address
        else:
            address = Address()
        address.address1 = address1
        address.address2 = address2
        address.city = city
        address.county = county
        address.state = state
        address.country = country
        address.zipcode = zipcode
        address.lat_long = lat_long
        address.save()

        profile.address = address
        profile.save()
        return instance


class AddressSerializer(serializers.HyperlinkedModelSerializer):
    lat_long = GeometryField()

    class Meta:
        model = Address
        fields = ('url', 'address1', 'address2', 'city', 'county', 'state', 'county', 'lat_long')


class FileSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.IntegerField(read_only=False, required=False)

    class Meta:
        model = File
        fields = ('id', 'url', 'filename', 'file', 'description')


class UserProfileSerializer(serializers.HyperlinkedModelSerializer):
    address = AddressSerializer()
    first_name = serializers.CharField(source="owner.first_name", read_only=True)
    last_name = serializers.CharField(source="owner.last_name", read_only=True)
    email = serializers.CharField(source="owner.email", read_only=True)
    address1 = serializers.CharField(source="address.address1", read_only=True)
    address2 = serializers.CharField(source="address.address2", read_only=True)
    city = serializers.CharField(source="address.city", read_only=True)
    county = serializers.CharField(source="address.county", read_only=True)
    state = serializers.CharField(source="address.state", read_only=True)
    country = serializers.CharField(source="address.country", read_only=True)
    zipcode = serializers.CharField(source="address.zipcode", read_only=True)
    distance = serializers.CharField(source="distance.mi", read_only=True)

    class Meta:
        model = UserProfile
        fields = (
            'url', 'id', 'owner', 'owned_tracts', 'owned_tracts_history', 'buyer', 'seller', 'consultant', 'mill',
            'company_name', 'address', 'phone', 'fax', 'cell', 'address', 'photo', 'first_name', 'last_name',
            'address1', 'address2', 'city', 'county', 'state', 'country', 'zipcode', 'email', 'description', 'distance'
        )


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'name')


class TractSerializer(serializers.HyperlinkedModelSerializer):
    owner_email = serializers.CharField(source='owner.owner.email', read_only=True)
    owner_first_name = serializers.CharField(source='owner.owner.first_name', read_only=True)
    owner_last_name = serializers.CharField(source='owner.owner.last_name', read_only=True)
    id = serializers.IntegerField(read_only=False, required=False)
    lat_long = GeometryField(allow_null=True, required=False)

    class Meta:
        model = Tract
        fields = ('url', 'id', 'acreage', 'title', 'pin', 'lat_long', 'gis_data', 'owner_email', 'owner_first_name', 'owner_last_name')


class ListingSerializer(serializers.HyperlinkedModelSerializer):
    lat_long = GeometryField(source='tract.lat_long', read_only=True, allow_null=True, required=False)
    tract_id = serializers.IntegerField(source='tract.id', read_only=True)
    when_added = serializers.DateTimeField(read_only=True)
    owner_email = serializers.CharField(source='owner.owner.email', read_only=True)
    owner_first_name = serializers.CharField(source='owner.owner.first_name', read_only=True)
    owner_last_name = serializers.CharField(source='owner.owner.last_name', read_only=True)
    photo = serializers.ImageField(source="owner.photo", use_url=True, read_only=True)
    tract = TractSerializer()
    files = FileSerializer(many=True, read_only=True)
    title = serializers.CharField(allow_null=True, required=False)
    description = serializers.CharField(allow_null=True, required=False)
    end_date = serializers.DateTimeField(allow_null=True, required=False)
    published = serializers.BooleanField(default=False)

    class Meta:
        model = Listing
        fields = ('url', 'id', 'tract_id', 'lat_long', 'tract', 'end_date', 'title',
                  'description', 'when_added', 'owner_email', 'photo', 'owner_first_name', 'owner_last_name',
                  'files', 'published')
        # read_only_fields = ('latitude', 'longitude', 'tract_id')

    def create(self, validated_data):
        tract_data = validated_data.pop('tract')
        tract_data['owner'] = validated_data['owner']
        if 'id' in tract_data:
            tract = Tract(**tract_data)
            tract.save()
        else:
            tract = Tract.objects.create(**tract_data)
        listing = Listing.objects.create(tract=tract, **validated_data)
        return listing

    def update(self, instance, validated_data):
        tract_data = validated_data.pop('tract')
        tract_data['owner'] = validated_data['owner']
        if 'id' in tract_data:
            tract = Tract(**tract_data)
            tract.save()
        else:
            tract = Tract.objects.create(**tract_data)

        instance.tract = tract
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.end_date = validated_data.get('end_date', instance.end_date)
        instance.published = validated_data.get('published', instance.published)
        instance.save()
        return instance


class BidSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Bid
        fields = ('url', 'listing', 'owner', 'when_bid', 'amount')

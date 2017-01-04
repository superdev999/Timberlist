from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from django.contrib.gis.db.models import PointField, GeoManager

import time


class UserProfile(models.Model):
    id = models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')
    owner = models.OneToOneField(User, related_name='profile')
    when_created = models.DateTimeField(auto_now_add=True)
    when_updated = models.DateTimeField(auto_now=True)
    buyer = models.BooleanField(default=False)
    seller = models.BooleanField(default=False)
    consultant = models.BooleanField(default=False)
    mill = models.BooleanField(default=False)
    company_name = models.TextField(null=True, max_length=512)
    address = models.OneToOneField('Address', null=True, related_name='profile')
    phone = models.CharField(blank=True, max_length=15)
    fax = models.CharField(blank=True, max_length=15)
    cell = models.CharField(blank=True, max_length=15)
    description = models.TextField(blank=True)
    photo = models.ImageField(blank=True, null=True, upload_to='profiles/%Y/%m/%d/')

    objects = GeoManager()

    def __unicode__(self):
        return self.owner.username + " - "+self.owner.email


class Tract(models.Model):
    acreage = models.FloatField(blank=True, null=True)
    owner = models.ForeignKey('UserProfile', related_name='owned_tracts')
    owner_history = models.ManyToManyField(UserProfile, related_name='owned_tracts_history')
    title = models.TextField(blank=True, null=True, default="Draft Tract")
    pin = models.TextField(blank=True, null=True)
    lat_long = PointField(null=True, blank=True)
    gis_data = models.TextField(blank=True, null=True)

    def __unicode__(self):
        return self.title


class Listing(models.Model):
    tract = models.ForeignKey('Tract')
    end_date = models.DateTimeField(null=True)
    title = models.TextField(null=True, blank=True, default="Draft Listing")
    description = models.TextField(null=True, blank=True)
    when_added = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey('UserProfile', related_name='listings')
    published = models.BooleanField(default=False)

    def __unicode__(self):
        return self.title


class Bid(models.Model):
    listing = models.ForeignKey('Listing')
    owner = models.ForeignKey('UserProfile')
    when_bid = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=9, decimal_places=2)


class Address(models.Model):
    address1 = models.TextField(max_length=512)
    address2 = models.TextField(blank=True, max_length=512)
    city = models.TextField(max_length=512)
    county = models.TextField(max_length=256)
    state = models.TextField(max_length=2)
    country = models.TextField(max_length=2)
    zipcode = models.TextField(max_length=10)
    lat_long = PointField(null=True)

    def __unicode__(self):
        return self.address1+", "+self.city+", "+self.state


# def file_path(instance, filename):
#     return time.strftime("files/%Y/%m/%d/")+instance.id+'-'+filename


class File(models.Model):
    filename = models.TextField()
    file = models.FileField(upload_to='files/%Y/%m/%d/', null=True)
    listing = models.ForeignKey('Listing', related_name='files')
    description = models.TextField(null=True, blank=True)
    owner = models.ForeignKey('UserProfile', related_name='files')

    def __unicode__(self):
        return self.filename

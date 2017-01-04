# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-07-11 00:49
from __future__ import unicode_literals

import django.contrib.gis.db.models.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timberlistapp', '0014_auto_20160608_0313'),
    ]

    operations = [
        migrations.AlterField(
            model_name='listing',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='listing',
            name='end_date',
            field=models.DateTimeField(null=True),
        ),
        migrations.AlterField(
            model_name='listing',
            name='title',
            field=models.TextField(blank=True, default='Draft Listing', null=True),
        ),
        migrations.AlterField(
            model_name='tract',
            name='lat_long',
            field=django.contrib.gis.db.models.fields.PointField(blank=True, null=True, srid=4326),
        ),
        migrations.AlterField(
            model_name='tract',
            name='title',
            field=models.TextField(blank=True, default='Draft Tract', null=True),
        ),
    ]

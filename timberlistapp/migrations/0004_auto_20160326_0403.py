# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-26 04:03
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timberlistapp', '0003_auto_20160320_2352'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='buyer',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='consultant',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='mill',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='seller',
            field=models.BooleanField(default=False),
        ),
    ]

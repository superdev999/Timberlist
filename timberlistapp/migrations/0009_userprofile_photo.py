# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-31 03:03
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timberlistapp', '0008_auto_20160331_0105'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='photo',
            field=models.FileField(null=True, upload_to='profiles/%Y/%m/%d/'),
        ),
    ]

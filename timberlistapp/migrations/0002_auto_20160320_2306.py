# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-03-20 23:06
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('timberlistapp', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='listing',
            name='who_added',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='listings', to='timberlistapp.UserProfile'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='listing',
            name='when_added',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
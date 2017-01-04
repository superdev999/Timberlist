from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from timberlistapp.models import *


class ListingAdmin(ImportExportModelAdmin):
    pass


class TractAdmin(ImportExportModelAdmin):
    pass


class UserProfileAdmin(ImportExportModelAdmin):
    pass


class AddressAdmin(ImportExportModelAdmin):
    pass


class FileAdmin(ImportExportModelAdmin):
    pass

# Register your models here.
admin.site.register(Listing, ListingAdmin)
admin.site.register(Tract, TractAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Address, AddressAdmin)
admin.site.register(File, FileAdmin)


class ListingResource(resources.ModelResource):

    class Meta:
        model = Listing

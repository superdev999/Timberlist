# Timberlist Web and Mobile Clients

Basic scaffolding based on https://github.com/Tivix/angular-django-registration-auth with angularjs 
upgraded to version 1.5.0.


## Build production distribution

```
grunt
```

## Inject <script> tags

After installing a new package via bower and updated bower.json, run the following to update the imports in index.html.  
"bower-install" is defined in Gruntfile.js.

```
grunt bower-install
```

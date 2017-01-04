# TimberList
The GitHub repo for TimberList

## Installing locally

Install required packages.
```
sudo apt-get install vim git libpq-dev python-dev postgresql postgresql-contrib npm python-pip postgis postgresql-9.3-postgis-2.1 libjpeg-dev
sudo pip install -U pip
sudo pip install virtualenv
sudo pip install virtualenvwrapper
```

Create our virtual python environment.
```
source /usr/local/bin/virtualenvwrapper.sh
mkvirtualenv timberlist
```

Checkout TimberList from GitHub and install the requirements.
```
mkdir dev
cd dev
git clone https://github.com/jadams5/TimberList.git
cd TimberList
pip install -r requirements.txt
sudo -u postgres psql -c "CREATE EXTENSION postgis; CREATE EXTENSION postgis_topology;" template1  --this could be the wrong db
```

Build and install client apps

```
cd client
sudo apt-get remove nodejs nodejs-dev
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install nodejs npm
sudo npm -g install npm@latest
sudo ln -s /usr/bin/nodejs /usr/bin/node
npm install
sudo npm -g install bower grunt-cli
bower install
cd..
```

Update postgres connection options. Change all "peer" and "md5" values to "trust".
```
sudo vi /etc/postgresql/<postgres_version>/main/pg_hba.conf
```

Create the postgres database
```
sudo service postgresql <start|reload>
sudo su - postgres
createdb timberlist
exit
cd ~/dev/TimberList
python manage.py migrate
python manage.py createsuperuser
```

Fire up the test server
```
python ./manage.py runserver
```



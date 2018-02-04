# HomeComix-API

The service which powers the HomeComix iOS app

### Requirements

- [Mongo](https://mongodb.github.io/node-mongodb-native/)
- [Unrar](https://www.rarlab.com/rar_add.htm)
- [Unzip](http://www.7-zip.org/)

By convenience the directory holding the database is located at `$HOME/.homecomix`

### Usage

- Assuming you already have Mongo running:

```bash
$ git clone https://github.com/TommyStarK/HomeComix-API.git
$ cd HomeComix-API
$ yarn install; yarn start
```

- Otherwise run before the following commands in a different terminal:

```bash
$ git clone https://github.com/TommyStarK/HomeComix-DB.git
$ cd HomeComix-DB
$ yarn install; yarn start
```

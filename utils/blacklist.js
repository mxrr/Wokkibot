const fs = require('fs');

module.exports = class Blacklist {
  constructor() {
    this.file = require('../blacklist');
    this.blacklist = new Map();

    this.file.forEach(user => {
      this.blacklist.set(user.id, { reason: user.reason });
    });
  }

  isBlacklisted (id) {
    if (this.blacklist.has(id)) return true;
    else return false;
  }

  get () {
    return this.blacklist;
  }

  add (id, reason) {
    return new Promise((resolve, reject) => {
      this.file.push({ id: id, reason: reason });
      fs.writeFile('./blacklist.json', JSON.stringify(this.file, null, 2), (err) => {
        if (err) reject(err);
        this.blacklist.set(id, { reason: reason });
        resolve(this.blacklist);
      });
    });
  }

  remove (id) {
    return new Promise((resolve, reject) => {
      if (this.isBlacklisted(id)) {
        this.file = this.file.filter(user => user.id === id);
        fs.writeFile('./blacklist.json', JSON.stringify(this.file, null, 2), (err) => {
          this.blacklist.delete(id);
          resolve(this.blacklist);
        });
      }
      else {
        resolve('User is not blacklisted');
      }
    });
  }
}
const KeytarStub = {
  _services: new Map(),

  findCredentials: function(service) {
    return new Promise(resolve => {
      const savedServices = this._services.get(service);
      if (savedServices) {
        resolve(savedServices);
      }

      resolve(undefined);
    });
  },

  getPassword: function(service, account) {
    return new Promise(resolve => {
      const savedService = this._services.get(service);
      if (savedService) {
        const savedAccount = savedService.get(account);

        if (savedAccount !== undefined) {
          return savedAccount;
        }
      }

      resolve(null);
    });  
  },

  setPassword: function(service, account, password) {
    return new Promise(resolve => {
      let savedService = this._services.get(service);
      if (!savedService) {
        savedService = new Map();
        this._services.set(service, savedService);
      }

      savedService.set(account, password);

      resolve(undefined);
    });
  },

  deletePassword: function(service, account) {
    return new Promise(resolve => {
      const savedService = this._services.get(service);
      if (savedService) {
        if (savedService.has(account)) {
          savedService.delete(account);
          return true;
        }
      }

      resolve(false);
    });
  }
};

module.exports = KeytarStub;

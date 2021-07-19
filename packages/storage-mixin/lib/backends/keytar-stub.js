const KeytarStub = {
  _services: new Map(),

  findCredentials: function(service) {
    const savedServices = this._services.get(service);
    if (savedServices) {
      return savedServices;
    }

    return undefined;
  },

  getPassword: function(service, account) {
    const savedService = this._services.get(service);
    if (savedService) {
      const savedAccount = savedService.get(account);

      if (savedAccount !== undefined) {
        return savedAccount;
      }
    }

    return null;
  },

  setPassword: function(service, account, password) {
    let savedService = this._services.get(service);
    if (!savedService) {
      savedService = new Map();
      this._services.set(service, savedService);
    }

    savedService.set(account, password);
  },

  deletePassword: function(service, account) {
    const savedService = this._services.get(service);
    if (savedService) {
      if (savedService.has(account)) {
        savedService.delete(account);
        return true;
      }
    }

    return false;
  }
};

module.exports = KeytarStub;

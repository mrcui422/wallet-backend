var express = require('express');
// var router = express.Router();

var BtcWalletController = require('../controllers/BtcWalletController.js');
var EthWalletController = require('../controllers/EthWalletController.js');

//var RolePolicy = require('../middlewares/rolePolicy.js');




module.exports = function(router){
  
  //Bitcoin
  router.get('/assets/btc/blockChainSync', BtcWalletController.blockChainSync);
  router.get('/assets/btc/newAddress', BtcWalletController.getNewAddress);
  router.get('/assets/btc/txStatus/:tx_id', BtcWalletController.getTxStatus);
  router.post('/assets/btc/sendTx', BtcWalletController.sendTx);
  //Eth
  router.get('/assets/eth/blockChainSync', EthWalletController.blockChainSync);
  router.get('/assets/eth/newAddress', EthWalletController.getNewAddress);
  router.get('/assets/eth/txStatus/:tx_id', EthWalletController.getTxStatus);
  router.post('/assets/eth/sendTx', EthWalletController.sendTx);
  
  //Qtum
  router.get('/assets/qtum/blockChainSync', BtcWalletController.blockChainSync);
  router.get('/assets/qtum/newAddress', BtcWalletController.getNewAddress);
  router.get('/assets/qtum/txStatus/:tx_id', BtcWalletController.getTxStatus);
  router.post('/assets/qtum/sendTx', BtcWalletController.sendTx);
  
  // Settings
  // 'POST /settings/reset_api_key'    : 'SettingsController.reset_api_key',
  //router.get('/settings',RolePolicy.requireRole(['owner', 'admin', 'manager', 'operator']) , SettingsController.settings_data);
  //router.put('/settings/update_profile',RolePolicy.requireRole(['owner', 'admin', 'manager', 'operator']) , SettingsController.update_profile);
  //router.put('/settings/update_team',RolePolicy.requireRole(['owner', 'admin', 'manager']) , SettingsController.update_team);
  //router.post('/settings/invite_teammate',RolePolicy.requireRole(['owner', 'admin', 'manager']) , SettingsController.invite_teammate);

  return router;

  
}

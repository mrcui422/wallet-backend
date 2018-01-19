var redisClient = require('../services/RedisService.js');

var ResponseService = require('../services/ResponseService.js')
	
//var env = process.env.NODE_ENV || 'development';
//var config = require(__dirname + '/../config.json')[env];
var config = require(__dirname + '/../config.json')['development'];

var Web3 = require('web3');
var web3 = new Web3();
//var web3 = new Web3('ws://35.225.27.127:8546');

module.exports = {

	blockChainSync: function(req, res) {
		redisClient.hget('daemons', 'eth', function (error, result) {
			if(error)
			{
				console.log('Redis Error', error);
				res.status(500).send({'message' : error});
			}
			
			var host = result.split(':')[0] || null;
			var port = result.split(':')[1] || 0;
			//var web3 = new Web3('ws://' + host + ':' + port);

			web3.setProvider(new web3.providers.HttpProvider('http://' + host + ':' + port));

			web3.eth.isSyncing()
			.then(function(sync){
	    		if (sync)
	        	{
	        		var percent = (sync.currentBlock / sync.highestBlock * 100).toFixed(2);
	        		res.status(200).send({synced: false, percentage: percent});
	        	}
	        	else
	        	{
	        		res.status(200).send({synced: true});
	        	}
			});	
		});
	},
	
	getNewAddress: function(req, res) {
		redisClient.hget('daemons', 'eth', function (error, result) {
			if(error)
			{
				console.log('Redis Error', error);
				res.status(500).send({message: error});
			}
			
			var host = result.split(':')[0] || null;
			var port = result.split(':')[1] || 0;
		    //var web3 = new Web3('ws://' + host + ':' + port);
			
			web3.setProvider(new web3.providers.HttpProvider('http://' + host + ':' + port));
			
			var account = web3.eth.accounts.create();
			var localAccount = web3.eth.accounts.wallet.add(account);
			res.status(200).send(localAccount);
		});
	},
	
	getTxStatus: function(req, res) {
		var tx_id = req.params.tx_id;
		redisClient.hget('daemons', 'eth', function (error, result) {
			if(error)
			{
				console.log('Redis Error', error);
				res.status(500).send({'message' : error});
			}
			
			var host = result.split(':')[0] || null;
			var port = result.split(':')[1] || 0;
		    //var web3 = new Web3('ws://' + host + ':' + port);
			
			web3.setProvider(new web3.providers.HttpProvider('http://' + host + ':' + port));

		    web3.eth.getTransaction(tx_id)
			.then(function (result) {
				res.status(200).send(result);
			});
		});
	},
			
	sendTx: function(req, res) {
		
		var parameters = req.body;
		
		var failure = (msg) => {
	        res.json({ success: false, message: msg });
	    };

		var success = (transactionHash) => {
		    res.json({ success: true, txHash: transactionHash });
	    };
	    
	    if (!parameters) {
	        failure('Invalid Parameter.');
	        return;
	    }
	    
		redisClient.hget('daemons', 'eth', function (error, result) {
			if(error)
			{
				console.log('Redis Error', error);
				failure(error);
			}
			
			var host = result.split(':')[0] || null;
			var port = result.split(':')[1] || 0;
		    //var web3 = new Web3('ws://' + host + ':' + port);
			
			web3.setProvider(new web3.providers.HttpProvider('http://' + host + ':' + port));

		    web3.eth.sendTransaction({
			    from: parameters.fromAddress,
			    to: parameters.toAddress,
			    value: web3.utils.toWei(parameters.amount, "ether"),
		        gas: 30000
			})
			.on('transactionHash', function(hash){
			    success(hash);
			 })
            .on('error', function (error) {
                failure(error);
            });
		});
	}
}


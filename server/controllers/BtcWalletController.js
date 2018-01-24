var redisClient = require('../services/RedisService.js');

var ResponseService = require('../services/ResponseService.js')

var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config.json')[env];

var Stratum = require('../priv_modules/unomp-merged-pooler');

module.exports = {

	blockChainSync: function(req, res) {
		var coin = req.url.split('/')[2];
		redisClient.hget('daemons', coin, function (error, result) {
			if(error)
			{
				console.log('Redis Error', error);
				res.status(500).send({error : error});
			}
			
			var daemonConfig = {
				host: result.split(':')[0] || null,
				port: result.split(':')[1] || 0,
				user: result.split(':')[2] || null,
				password: result.split(':')[3] || null,
			};
			
			var daemon = new Stratum.daemon.interface([daemonConfig], function(severity, message){
	            console.log('Daemon Key RPC', message);
	        });
	        
			var generateProgress = () => {
	    		daemon.cmd('getinfo', [], function(results) {
	            	var blockCount = results.sort(function (a, b) {
	                	return b.response.blocks - a.response.blocks;
	           		})[0].response.blocks;

		            //get list of peers and their highest block height to compare to ours
		            daemon.cmd('getpeerinfo', [], function(results){

		                var peers = results[0].response;
		                var totalBlocks = peers.sort(function(a, b){
		                    return b.startingheight - a.startingheight;
		                })[0].startingheight;

		                var percent = (blockCount / totalBlocks * 100).toFixed(2);
		                console.log('Downloaded ' + percent + '% of blockchain from ' + peers.length + ' peers');
		                res.status(200).send({synced: false, percentage: percent, error: null});
		            });
	        	});
			};
		
		    daemon.cmd('getblocktemplate', [], function(results){
		        var synced = results.every(function(r){
		            return !r.error || r.error.code !== -10;
		        });
		        if (synced){
		            res.status(200).send({ synced: true, error: null });
		        }
		        else{
		            if (!process.env.forkId || process.env.forkId === '0')
		            	console.log('Daemon is still syncing with network (download blockchain) - server will be started once synced');
		            // setTimeout(checkSynced, 5000);

		            //Only let the first fork show synced status or the log wil look flooded with it
		            if (!process.env.forkId || process.env.forkId === '0')
		                generateProgress();
		        }
		    });
		});	
	},
	
	getNewAddress: function(req, res) {
		var coin = req.url.split('/')[2];
		redisClient.hget('daemons', coin, function (error, result) {
			if(error)
			{
				console.log('Redis Error', error);
				res.status(500).send({error: error});
			}
			
			var daemonConfig = {
				host: result.split(':')[0] || null,
				port: result.split(':')[1] || 0,
				user: result.split(':')[2] || null,
				password: result.split(':')[3] || null,
			};
			
			var daemon = new Stratum.daemon.interface([daemonConfig], function(severity, message){
	            console.log('Daemon Key RPC', message);
	        });
		
		    daemon.cmd('getnewaddress', [], function(results){
		    	if(!results[0].error)
		    	{	    		
	    			res.status(200).send({address: results[0].response, error: null});
		    	}
		    	else
		    		res.status(404).send({error: results[0].error.message});
		    });  
		});
	},
	
	getTxStatus: function(req, res) {
		var tx_id = req.params.tx_id;
		var coin = req.url.split('/')[2];
		redisClient.hget('daemons', coin, function (error, result) {
			if(error)
			{
				console.log('Redis Error', error);
				res.status(500).send({error: error});
			}
			
			var daemonConfig = {
				host: result.split(':')[0] || null,
				port: result.split(':')[1] || 0,
				user: result.split(':')[2] || null,
				password: result.split(':')[3] || null,
			};
			
			var daemon = new Stratum.daemon.interface([daemonConfig], function(severity, message){
	            console.log('Daemon Key RPC', message);
	        });
		
		    daemon.cmd('gettransaction', [tx_id], function(results){
		    	if(!results[0].error)
		    	{
		    	    var response = { txid: results[0].response.txid };
		    	    response.txAmount = results[0].response.amount;
		    	    response.confirmations = results[0].response.confirmations;

		    	    if (response.confirmations == 0)
		    	        response.txStatus = 'pending';
		    	    else if (response.confirmations < 3)
		    	        response.txStatus = 'progress';
		    	    else
		    	        response.txStatus = 'confirmed';

		    	    response.error = null;
		    	    response.networkTxDetails = results[0].response;
		    	    res.status(200).send(response);
		    	}
		    	else
		    		res.status(404).send({error: results[0].error.message});
		    });  
		});
	},
		
	sendTx: function(req, res) {
		
		var parameters = req.body;
		
		var failure = (msg) => {
	        res.json({ error: msg });
	    };

	    var success = (transactionHash) => {
	        res.json({ txid: transactionHash, error: null});
	    };
	    
		if (!parameters) {
	        failure('Invalid Parameter.');
	        return;
	    }
	    
		var coin = req.url.split('/')[2];
		redisClient.hget('daemons', coin, function (error, result) {
			if(error)
			{
				console.log('Redis Error', error);
				failure(error);
			}
			
			var daemonConfig = {
				host: result.split(':')[0] || null,
				port: result.split(':')[1] || 0,
				user: result.split(':')[2] || null,
				password: result.split(':')[3] || null,
			};
			
			var daemon = new Stratum.daemon.interface([daemonConfig], function(severity, message){
	            console.log('Daemon Key RPC', message);
	        });
		
		    daemon.cmd('sendtoaddress', [parameters.toAddress, parameters.amount], function(results){
		    	if(!results[0].error)
		    	{	    		
	    			success(results[0].response);
		    	}
		    	else
		    		failure(results[0].error.message);
		    });  
		});
	}	
}


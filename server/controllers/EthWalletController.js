var redisClient = require('../services/RedisService.js');

var ResponseService = require('../services/ResponseService.js')

//var env = process.env.NODE_ENV || 'development';
//var config = require(__dirname + '/../config.json')[env];
var config = require(__dirname + '/../config.json')['development'];

var Web3 = require('web3');
var web3 = new Web3();

var Personal = require('web3-eth-personal');
var personal = new Personal();
//var web3 = new Web3('ws://35.225.27.127:8546');

var fs = require('fs');

module.exports = {

	blockChainSync: function(req, res) {
	    redisClient.hget('daemons', 'eth', function (error, result) {
	        if(error)
	        {
	            console.log('Redis Error', error);
	            res.status(500).send({error : error});
	        }
			
	        var host = result.split(':')[0] || null;
	        var port = result.split(':')[1] || 0;
	        //var web3 = new Web3('ws://' + host + ':' + port);

	        web3.setProvider(new web3.providers.HttpProvider('http://' + host + ':' + port));

	        web3.eth.getSyncing(function (error, sync){
	            if (!error)
	            {
	                if (sync) {
	                    var percent = (sync.currentBlock / sync.highestBlock * 100).toFixed(2);
	                    res.status(200).send({ synced: false, percentage: percent, error: null });
	                }
	                else {
	                    res.status(200).send({ synced: true, error: null });
	                }
	            }
	            else {
	                res.status(400).send({ error: error });
	            }
	        });
		});
	},
	
	getNewAddress: function(req, res) {
		redisClient.hget('daemons', 'eth', function (error, result) {
			if(error)
			{
				console.log('Redis Error', error);
				res.status(500).send({error: error});
			}
			
			var host = result.split(':')[0] || null;
			var port = result.split(':')[1] || 0;
		    //var web3 = new Web3('ws://' + host + ':' + port);
			
			personal.setProvider(new personal.providers.HttpProvider('http://' + host + ':' + port));
			
			//var account = web3.eth.accounts.create();
		    //var localAccount = web3.eth.accounts.wallet.add(account);
		    //res.status(200).send({ address: localAccount.address, privateKey: localAccount.privateKey, index: localAccount.index, error: null });
		    personal.newAccount('$passw0rd#')
            .then(function (address) {
                res.status(200).send({ address: address, error: null });
            });
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

			var result = web3.eth.getTransaction(tx_id);
			web3.eth.getTransaction(tx_id, function (error, result) {
			    if(!error)
			    {
			        console.log(result);
			        var blockNumber = web3.eth.blockNumber;
			        var response = { txid: result.hash };
			        response.txAmount = web3.fromWei(result.value, 'ether');
			        if (result.blockNumber == null) {
			            response.confirmations = 0;
			            response.txStatus = 'pending';
			        }
			        else {
			            response.confirmations = blockNumber - result.blockNumber;
			            response.txStatus = response.confirmations > 11 ? 'confirmed' : 'progress';
			        }
			        response.error = null;
			        response.networkTxDetails = result;
			        res.status(200).send(response);
			    }
			    else{
			        res.status(400).send({error: error});
			    }
			});
		});
	},
			
	sendTx: function(req, res) {
		
		var parameters = req.body;
		
	    if (!parameters) {
	        res.status(400).send({ error: 'Invalid Parameter' });
	        return;
	    }
	    
		redisClient.hget('daemons', 'eth', function (error, result) {
			if(error)
			{
				console.log('Redis Error', error);
				res.status(500).send({error: error});
			}
			
			var host = result.split(':')[0] || null;
			var port = result.split(':')[1] || 0;
		    //var web3 = new Web3('ws://' + host + ':' + port);

			web3.setProvider(new web3.providers.HttpProvider('http://' + host + ':' + port));

			redisClient.hget('contracts', parameters.symbol, function (error, result) {
			    if (error) {
			        console.log('Redis Error', error);
			        res.status(500).send({ error: error });
			    }

			    var contractAddress = result;

			    var abiArray = JSON.parse(fs.readFileSync(__dirname + '/../contracts/zrx.json', 'utf-8'));

			    var contract = web3.eth.contract(abiArray).at(contractAddress);
			    var senderAddress = parameters.fromAddress;
			    var receiverAddress = parameters.toAddress;

			    var callData = contract.transfer.getData(receiverAddress, web3.toWei(parameters.amount));

			    var gasEstimate = web3.eth.estimateGas({
			        from: senderAddress,
			        to: contractAddress,
			        data: callData
			    });

			    var gasPrice = web3.eth.gasPrice;
			    console.log('gas Price: ' + gasPrice);
			    console.log('Estimated Transaction gas: ' + gasEstimate);

			    console.log('unlocking Coinbase account');
			    const password = "$passw0rd#";
			    try {
			        web3.personal.unlockAccount(senderAddress, password);
			    } catch (e) {
			        console.log(e);
			        res.status(400).send({ error: e });
			        return;
			    }

			    console.log('sending Transaction to the contract');

			    // For Real this time: 
			    const transaction = {
			        from: senderAddress,
			        gas: gasEstimate + 1,
			        gasPrice: gasPrice + 1
			    }

			    contract.transfer.sendTransaction(receiverAddress, web3.toWei(parameters.amount), transaction, function (error, txHash) {
			        if (error != null) {
			            res.status(400).send({ error: error.toString() });
			        }
			        else {
			            console.log("Transaction Sent here's you  txHash: " + txHash);
			            res.status(200).send({ txid: txHash, error: null });
			        }
			    });
			});
		});
	}
}


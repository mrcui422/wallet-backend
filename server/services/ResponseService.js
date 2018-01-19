module.exports = {

  success: (res) => {
    return (object) => {
      res.json(object || {});
    };
  },

  failure: (res) => {

    return (err) => {

      var error_message;

      if (err && err.reason) {
        error_message = err.reason;
      }
      else if (err && err.message) {
        error_message = err.message;
      }
      else if (err && err.description) {
        error_message = err.description;
      }
      else {
        error_message = "Something went wrong";
      }

      var code = (!err || isNaN(err.code)) ? 400 : err.code;

      if (err) {
        
        console.log(err);

        res.status(code || 400).send({
          success : false,
          message : error_message
        });
      }
      else {
        res.status(code || 400).send({
          success : false,
          message : "Something went wrong"
        });
      }
    };
  }
};

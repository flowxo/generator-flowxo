module.exports = {
  repeatedPrompt: function(name,prompts,cb){
    var self = this;
    var totalAnswers = [];

    var repeatQuestion = [{
      type: 'confirm',
      name: 'again',
      message: 'Would you like to define another ' + name,
      default: true
    }];

    var doPrompt = function(){
      self.prompt(prompts,function(answers){
        totalAnswers.push(answers);
        self.prompt(repeatQuestion,function(repeat){
          if(repeat.again){
            doPrompt();
          }else{
            cb(totalAnswers);
          }
        })
      });
    };
    doPrompt();
  }
};
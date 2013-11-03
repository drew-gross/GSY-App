Users = new Meteor.Collection('users');

if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to MyApp.";
  };

  Template.hello.events({
    'click input' : function () {
    }
  });
}

if (Meteor.isServer) {
  var Twilio = Meteor.require("twilio");
  var twilio = Twilio("AC13642f13b36d9a03fa84a7e734658e80", "3a02c33ae28dfe7690fb0737280bd4a6");
  Meteor.startup(function () {
  });

  Meteor.methods({
      send_sms: function() {
          twilio.sendSms({
                to:'+60177753265', // Any number Twilio can deliver to
                from: '+15128654855', // A number you bought from Twilio and can use for outbound communication
                body: 'Test from team 31' // body of the SMS message
              }, function(err, responseData) { //this function is executed when a response is received from Twilio
                console.log(err);
                console.log(responseData.body);
          });
      }
  });

  Meteor.Router.add('/voice', 'POST', function() {
    var user = Users.findOne({number: this.request.body.From});
    var userid = 0;
    var xml = "";
    if (!user) {
      userid = Users.insert({number: this.request.body.From});
      xml = Handlebars.templates.new_user({});
    } else {
      userid = user._id;
      xml = Handlebars.templates.requesttype({});
    }

    return [200, {"Content-Type": "text/xml"}, xml];
  });

  Meteor.Router.add('/expense_type', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    Users.update(userid, {$push: {expense_type: this.request.body.Digits}});
    if (this.request.body.Digits === "1" || this.request.body.Digits === "2" || this.request.body.Digits === "3") {
      return [200, {"Content-Type": "text/xml"}, Handlebars.templates.expenseslist({})];
    }
    else if (this.request.body.Digits === "4") {
      return [200, {"Content-Type": "text/xml"}, Handlebars.templates.requesttype({})];
    }
  });

  Meteor.Router.add('/expense_amount', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    Users.update(userid, {$push: {dollars: this.request.body.Digits}});
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.expense_type({})];
  });


  //new user flow
  Meteor.Router.add('/family_members', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    Users.update(userid, {$set: {family_members: this.request.body.Digits}});
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.age_and_sex({})];
  });

  Meteor.Router.add('/age_and_sex', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    if (this.request.body.TranscriptionText) {
      Users.update(userid, {$set: {family_info: this.request.body.TranscriptionText}});
    }
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.familyincome({})];
  });

  Meteor.Router.add('/familyincome', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    Users.update(userid, {$set: {familyincome: this.request.body.Digits}});
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.debtlevel({})];
  });

  Meteor.Router.add('/debtlevel', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    Users.update(userid, {$set: {familyincome: this.request.body.Digits}});
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.savinggoals({})];
  });

  Meteor.Router.add('/savinggoals', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    Users.update(userid, {$set: {savinggoals: this.request.body.Digits}});
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.location({})];
  });

  Meteor.Router.add('/location', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    if (this.request.body.TranscriptionText) {
      Users.update(userid, {$set: {location: this.request.body.TranscriptionText}});
    }
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.expense_type({})];///<------sms user registration
  });
///////////////////
      Meteor.Router.add('/requesttype', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    if (this.request.body.Digits === "1") {
      return [200, {"Content-Type": "text/xml"}, Handlebars.templates.expense_type({})];
    } else if (this.request.body.Digits === "2") {
      return [200, {"Content-Type": "text/xml"}, Handlebars.templates.send_report({
        to: this.request.body.From,
        transportation: Users.findOne(userid).transportation.slice(-1)[0]
      })];
    }
  });
  
    Meteor.Router.add('/expenseslist', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
  if (this.request.body.Digits === "1") {
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.groceries({})];
  }
  else if (this.request.body.Digits === "2") {
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.bills({})];
  }
  else if (this.request.body.Digits === "3") {
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.transportation({})];
  }
  else if (this.request.body.Digits === "4") {
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.rent({})];
  }
  else if (this.request.body.Digits === "5") {
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.other_expenses({})];
  }
  else if (this.request.body.Digits === "6") {
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.expense_type({})];
  }
  });
  
  
    Meteor.Router.add('/groceries', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    if (this.request.body.TranscriptionText) {
      Users.update(userid, {$push: {groceries: this.request.body.TranscriptionText}});
    }
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.expenseslist({})];
  });
  
    Meteor.Router.add('/transportation', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    Users.update(userid, {$push: {transportation: this.request.body.Digits}});
  return [200, {"Content-Type": "text/xml"}, Handlebars.templates.expenseslist({})];
  });
  
      Meteor.Router.add('/rent', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    Users.update(userid, {$push: {rent: this.request.body.Digits}});
  return [200, {"Content-Type": "text/xml"}, Handlebars.templates.expenseslist({})];
  });
  
      Meteor.Router.add('/other_expenses', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    Users.update(userid, {$push: {other_expenses: this.request.body.Digits}});
  return [200, {"Content-Type": "text/xml"}, Handlebars.templates.expenseslist({})];
  });
  
  Meteor.Router.add('/bills', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    Users.update(userid, {$push: {bills: this.request.body.Digits}});
  if (this.request.body.Digits === "1") {
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.water({})];
  }
  else if (this.request.body.Digits === "2") {
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.electricity({})];
  }
  else if (this.request.body.Digits === "3") {
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.maintenance({})];
  }
    else if (this.request.body.Digits === "4") {
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.expenseslist({})];
  }
  });
  
  
    Meteor.Router.add('/water', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    Users.update(userid, {$push: {water: this.request.body.Digits}});
  return [200, {"Content-Type": "text/xml"}, Handlebars.templates.bills({})];
  });
  
    Meteor.Router.add('/electricity', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    Users.update(userid, {$push: {electricity: this.request.body.Digits}});
  return [200, {"Content-Type": "text/xml"}, Handlebars.templates.bills({})];
  });
  
    Meteor.Router.add('/maintenance', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    Users.update(userid, {$push: {maintenance: this.request.body.Digits}});
  return [200, {"Content-Type": "text/xml"}, Handlebars.templates.bills({})];
  });
  

  
    Meteor.Router.add('/logduration', 'POST', function() {
    var userid = Users.findOne({number: this.request.body.From})._id;
    Users.update(userid, {$push: {logduration: this.request.body.Digits}});
    return [200, {"Content-Type": "text/xml"}, Handlebars.templates.logduration({})];
  });
  
}

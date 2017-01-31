// alert("This is an alert I created in index.js!");
// var element = document.createElement('div');
// var text = document.createTextNode('This is some text');
// element.appendChild(text);
// document.body.appendChild(element);

//
// Item prototype
//
var item = $$({}, '<li><span data-bind="content"/> <button>x</button></li>', '& span { cursor:pointer; }', {
  'click span': function(){
    var input = prompt('Edit to-do item:', this.model.get('content'));
    if (!input) return;
    this.model.set({content:input});
  },
  'click button': function(){
    this.destroy();
  }
});

//
// List of items
//
var list = $$({}, '<div id="content"> <button id="new">New item</button> <ul></ul> </div>', {
  'click #new': function(){
  var newItem = $$(item, {content:'Click to edit'});
  this.append(newItem, 'ul'); // add to container, appending at <ul>
  }
});

$$.document.append(list);



// From: http://www.webdeveloper.com/forum/showthread.php?266743-Switch-Div-Content-Using-Javascript&p=1229155#post1229155

// function showDiv(idInfo) {
  // var sel = document.getElementById('divLinks').getElementsByTagName('div');
  // for (var i=0; i<sel.length; i++) { sel[i].style.display = 'none'; }
  // document.getElementById('container'+idInfo).style.display = 'block';
  // return false;
// }
// 
// function compute() {
	// var x = 5;
	// var y = 4;
	// var z = x * y;
	// var text = "hello : ";
	// document.getElementById('answer').innerHTML = text + z;
	// return text + z;
// }

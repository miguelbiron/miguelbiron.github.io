// define global variables
var members = [], balances = [], A_mat;

function add_member_fields() {
  /*
  html_code = '<div class="member-balance">\n' +
              '  <input type="text" name="member" placeholder="Enter name...">\n' +
              '  <input type="text" name="balance" placeholder="Enter balance...">\n' +
              '</div>\n';
  
  document.getElementById("balances-check").innerHTML += html_code;
  */
  
   var new_container = document.createElement("div");
   new_container.className = "member-balance";
   var input = document.createElement("input");
   input.type = "text";
   input.name = "member";
   input.placeholder="Enter name...";
   new_container.appendChild(input);
   new_container.appendChild(document.createTextNode(" "));
   input = document.createElement("input");
   input.type = "text";
   input.name = "balance";
   input.placeholder="Enter balance...";
   new_container.appendChild(input);
   
   var container = document.getElementById("member-balance-list");
   container.appendChild(new_container);

}

function parse_inputs() {
  // clear contents of global arrays
  members.length = 0;
  balances.length = 0;
  
  // read inputs
  var md_list = document.getElementsByClassName("member-balance");
  console.log(md_list.length);
  
  var i;
  for (i = 0; i < md_list.length; i++) {
     var md = md_list[i].getElementsByTagName("input");
     
     console.log(md.length);
     
     var j;
     for (j = 0; j < md.length; j++) {
       
       var in_field = md[j];
       var field_type = in_field.name;
       var field_val = in_field.value;
       
       if (field_val.length > 0){
         console.log("campo valido encontrado");
         if (field_type === "member"){
           console.log("Es miembro");
           members.push(field_val);
         } else if (field_type === "balance"){
           console.log("Es deuda");
           balances.push(parseFloat(field_val));
         }
       }
     }
     
  }
  
  // check lengths are equal
  if (members.length != balances.length){
    document.getElementById("members-summary").innerHTML = "Error! Each member must have a name and a valid outstanding balance.";
    return;
  }
  
  // print list of members
  var text = members[0];
  for (i = 1; i < members.length; i++){
    text += ", " + members[i];
  }
  document.getElementById("members-summary").innerHTML = "Ok then, we have " + members.length + " valid members: " + text;
  
  // check balances sum to 0
  var total_balance = 0;
  for (i = 0; i < balances.length; i++){
    total_balance += balances[i];
  }
  if (Math.abs(total_balance) < 1e-9){
    document.getElementById("balances-check").innerHTML = "Great, balances sum to 0.";
  } else{
    document.getElementById("balances-check").innerHTML = "Error! balances sum to " + total_balance;
  }
  
}

// build constraint matrix
function get_const_mat(n){
  
  var block = mat([ones(n-1), mulScalarMatrix(-1,eye(n-1))], true);
  var A = mulScalarMatrix(1,block); // so that it copies block
  
  for (var i=1; i<n; i++){
    swaprows(block, i-1, i);
    A = mat([A, block]);
  }
  
  return A;
}

// set constraint matrix
function set_const_mat(){
  A_mat = get_const_mat(members.length);
}

// solve
function settle_debts(){
  set_const_mat();
  var k = members.length*(members.length-1);
  var c = ones(k);
  var lb = zeros(k);
  var x_opt = lp(c, [], [], A_mat, balances, lb, []);
  var A = vec_2_mat(x_opt);
  print_results(A);
}

// convert vector to array2d
function vec_2_mat(x_opt){
  var n = members.length;
  var M = zeros(n, n);
  var k = 0;
  
  for(var i = 0; i<n; i++){
    for(var j = 0; j<n; j++){
      if(j != i){
        set(M,j,i,x_opt[k]);
        k++;
      }
    }
  }
  return M;
}

// print table with solution
function print_results(M){
  console.log(M.type);
  console.log(M.m+M.n);
  var table = document.createElement('table');
  var tableBody = document.createElement('tbody');
  
  // table header
  var row = document.createElement('tr');
  var cell = document.createElement('td');
  cell.appendChild(document.createTextNode(""));
  row.appendChild(cell);
  
  for(var i = 0; i<members.length; i++){
    cell = document.createElement('td');
    cell.appendChild(document.createTextNode(members[i]));
    row.appendChild(cell);
  }
  tableBody.appendChild(row);
  
  // contents
  var k=0;
  for(i = 0; i<members.length; i++){
    row = document.createElement('tr');
    
    // name of i-th member
    cell = document.createElement('td');
    cell.appendChild(document.createTextNode(members[i]));
    row.appendChild(cell);
    
    // payments of i-th member
    for(var j = 0; j<members.length; j++){
      cell = document.createElement('td');
      cell.appendChild(document.createTextNode(get(M,i,j)));
      row.appendChild(cell);
    }
    
    tableBody.appendChild(row);
    console.log("Fin fila " + i);
  }

  table.appendChild(tableBody);
  document.getElementById("results-table").appendChild(table);
}
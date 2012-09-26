// JavaScript Document

function ucfirst(str) {
    var firstLetter = str.substr(0, 1);
    return firstLetter.toUpperCase() + str.substr(1);
}

function serialize( mixed_value ) {
    var _getType = function( inp ) {
        var type = typeof inp, match;
        var key;
        if (type == 'object' && !inp) {
            return 'null';
        }
        if (type == "object") {
            if (!inp.constructor) {
                return 'object';
            }
            var cons = inp.constructor.toString();
            match = cons.match(/(\w+)\(/);
            if (match) {
                cons = match[1].toLowerCase();
            }
            var types = ["boolean", "number", "string", "array"];
            for (key in types) {
                if (cons == types[key]) {
                    type = types[key];
                    break;
                }
            }
        }
        return type;
    };
    var type = _getType(mixed_value);
    var val, ktype = '';
    
    switch (type) {
        case "function": 
            val = ""; 
            break;
        case "undefined":
            val = "N";
            break;
        case "boolean":
            val = "b:" + (mixed_value ? "1" : "0");
            break;
        case "number":
            val = (Math.round(mixed_value) == mixed_value ? "i" : "d") + ":" + mixed_value;
            break;
        case "string":
            val = "s:" + mixed_value.length + ":\"" + mixed_value + "\"";
            break;
        case "array":
        case "object":
            val = "a";
            var count = 0;
            var vals = "";
            var okey;
            var key;
            for (key in mixed_value) {
                ktype = _getType(mixed_value[key]);
                if (ktype == "function") { 
                    continue; 
                }
                
                okey = (key.match(/^[0-9]+$/) ? parseInt(key, 10) : key);
                vals += serialize(okey) +
                        serialize(mixed_value[key]);
                count++;
            }
            val += ":" + count + ":{" + vals + "}";
            break;
    }
    if (type != "object" && type != "array") {
      val += ";";
  }
    return val;
}

function msguser(msg){
	$.fn.colorbox({html: "<p>"+msg+"</p>", open: true, opacity: .4, transition: 'none'});	
}

function showcart(){
	$.get(root+"scripts/php/cartfuncs.php", {action: 'showcart'}, function(data){
		$("#sys_shoppingcart").html(data);
	});	
	$.get(root+"scripts/php/cartfuncs.php", {action: 'showcheckout'}, function(data){
		$("#sys_checkout").html(data);
	});	
}

function addToCart(prod){
	var quantity = $("#productQuantityField").val();
	var variants = new Array();
	$.each($(".sys_variant_selectboxes"), function(){
		variants.push($(this).attr('id')+ "#~#" +$(this).val());
	});
	variants = serialize(variants);
	
	if (isNaN(quantity) || quantity < 0){
		msguser("you must enter a number greater than 0");
		return;	
	}
	else {
		$.get(root+"scripts/php/cartfuncs.php", {action: 'add', id: prod, quantity: quantity, variants: variants}, function(data){
			showcart();
		});	
		msguser("Product added to cart");
	}
}

function checkoutRemove(num){
	$.get(root+"scripts/php/cartfuncs.php", {action: 'del', key: num}, function(data){
		showcart();
	});		
	msguser("Product removed from cart");
}
function checkoutUpdate(num){
	var quantity = parseInt($("#sys_checkoutUpdate"+num).val());
	$.get(root+"scripts/php/cartfuncs.php", {action: 'update', key: num, quantity: quantity}, function(data){
		showcart();
	});		
	msguser("Cart Updated");
}

function sys_gopay(){
	var total = parseFloat($("#sys_carttotal").html());
	var deliverynames = new Array();
	var deliveryvalues = new Array();
	var errors = new Array();
	var paymentmethod = $("input[name=sys_paymethod]:checked").val();
	var textalert;
	
	$("#sys_deliverydetails input, #sys_deliverydetails select, #sys_deliverydetails textarea").each(function(){
		deliverynames.push($(this).attr('name'));
		deliveryvalues.push($(this).val());
		if ($(this).attr('rel') == "required" && $(this).val() == ""){
			errors.push($(this).attr('name'));
		}
	});
	if ($("input[name=sys_textalert]").length > 0){
		textalert = $("input[name=sys_textalert]").val();
		if (textalert != ""){
			textalert = textalert.replace(/\D/g, '');
			if (textalert[0] == "3"){
				textalert = textalert.substr(3);
			}
			if (textalert[0] == "0"){
				textalert = textalert.substr(1);
			}
			if (textalert.length != 9 || textalert[0] != "8"){
				errors.push("Incorrect Mobile Phone Number.  This system only accepts ROI mobile numbers");
			}	
		}
	}
	var name = $(".sys_custname").val();
	var email = $(".sys_custemail").val();
	var address= new Array();
	$(".sys_custaddress").each(function(){
		address.push($(this).val());
	});
	address = serialize(address);

	if (total < 0.01){
		errors.push('Your cart may be empty or equal to 0');
	}
	if (errors.length > 0){
		msguser('There are problems with your order:<br /><br />'+errors.join("<br />"));
		return;
	}
	else {
		deliverynames = serialize(deliverynames);
		deliveryvalues = serialize(deliveryvalues);
		$.getScript(root+'paymodules/'+paymentmethod+'/exfuncs.js', function(){
			completepay(total, deliverynames, deliveryvalues, errors, paymentmethod, name, email, address, textalert);
		});
	}
}

function choosepaymentmethod(){
	var method = $("input[name=sys_paymethod]:checked").val();
	$(".sys_paymentbox").hide();
	$("#sys_"+method+"box").show();	
}

function sys_changedelivery(num){
	$.get(root+"scripts/php/cartfuncs.php", {action: 'deliverychange', key: num}, function(data){
		showcart();
	});	
}	

function sys_applyPromoCode(){
	var code = $("#sys_promocode").val();
	if (code == ""){
		msguser("No code was entered");	
		return;
	}
	$.get(root+"scripts/php/cartfuncs.php", {action: 'applypromocode', code: code}, function(data){
		data = data.split("#~#");
		if (data[0] == 1){
			showcart();
			msguser(data[1]);
		}
		else {
			msguser(data[1]);	
			return;
		}
		
	});	
}

function sys_affectprice(){
	var text, number, sign, price;
	price = $("#sys_origprice").text();

	$(".sys_variant_selectboxes").each(function(){
		text = $("#"+$(this).attr('id')+" option:selected").text();
		number = text.replace (/[^\d\.]/g, "");
		if (isNaN(number) || number == ""){
			number = 0;	
		}
		sign = text.replace(/[^\+\-]/g, "");
		if (sign == "-"){
			price = parseFloat(price) - parseFloat(number);
		}
		else{
			price = parseFloat(price) + parseFloat(number);
		}
		
	});
	$("#sys_price").html("&euro;"+price.toFixed(2));
}
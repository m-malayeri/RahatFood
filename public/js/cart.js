function cartAction(action,vendor_id,id) {
	var queryString = "";
	
	if(action != "") {
		switch(action) {
			case "add":
				queryString = 'action='+action+'&vendor_id='+vendor_id+'&id='+id;
			break;
			case "remove":
				queryString = 'action='+action+'&vendor_id='+vendor_id+'&id='+id;
			break;
			case "empty":
				queryString = 'action='+action+'&vendor_id='+vendor_id;
			break;
			case "initial":
				queryString = 'action='+action+'&vendor_id='+vendor_id;
			break;
		}	 
	}
	
	jQuery.ajax({
	url: window.location.origin+"/rahatfood/public/ajax_action",
	data:queryString,
	type: "get",
	success:function(data){
		$("#cart-item").html(data);
		$("#cart-item-mt").html(data);
	},
	error:function (){}
	});
}
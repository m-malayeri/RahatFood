<?php
	function number2farsi($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		$string=number_format($string, 0, ',', ',');
		return str_replace($en_num, $fa_num, $string);
	}
	function number2farsi2($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		return str_replace($en_num, $fa_num, $string);
	}	
?>
	
@extends('layouts.internal')
@section('title', '- '.$restaurant->name)
@section('seo')
	<meta name="description" content="{{$restaurant->name}} همدان">
	<meta name="keywords" content="سفارش, سفارش غذا, سفارش اینترنتی غذا, سفارش آنلاین غذا, سفارش غذا همدان,رستورانهای همدان, رستوران {{$restaurant->name}} همدان">
@endsection

@section('top')
	<div class="restaurant-top" style="background:url('{{URL::asset('../public/storage/'.$restaurant->cover)}}') no-repeat center;background-size:cover;">
		<div class="container">
			<div class="row">
				<div class="col-md-2 col-sm-3 col-xs-12" style="width:140px;">
					<img src="{{ URL::asset('../public/storage/'.$restaurant->logo) }}" class="restaurant-logo" width="120" height="120" alt="لوگوی رستوران- راحت فود" >
				</div>
				<div class="col-md-10 col-sm-9 col-xs-12">
					<h2 style="margin-top:5px;" class="restaurant-details">{{$restaurant->name}}</h2>
					<h4 class="restaurant-details">{{$restaurant->address}}</h4>	
					<div style="direction:ltr;">
						<input type="text" id="stars2" name="stars" value="{{$restaurant->stars}}" class="rating" data-min=0 data-max=5 data-step=0.1 data-rtl="true" data-container-class='text-right' data-glyphicon=0 readonly>
					</div>
				</div>
			</div>
		</div>
	</div>
@endsection

@section('content')
	<div class="col-md-12 hidden-xs">
		<ol class="breadcrumb">
			<li><a href="{{url('/home')}}"><i class="icon-home"></i></a></li>
			@if(url('/area/'.$area->id.'/'.$area->name)!=url('area/geo/محل فعلی کاربر'))
				<li><a href="{{url('/area/'.$area->id.'/'.$area->name)}}">{{$area->name}}</a></li>
			@endif
			<li class="active">{{$restaurant->name}}</li>
		</ol>
	</div>
	
	<div class="col-md-9 col-sm-12">
		<ul class="nav nav-tabs nav-justified nav-stacked" role="tablist" style="padding-right:0px;">
			<li role="presentation" class="active"><a data-toggle="tab" href="#menu"><i class="icon-list"></i>   منو</a></li>
			<li role="presentation"><a data-toggle="tab" href="#information"><i class="icon-info-sign"></i>   اطلاعات</a></li>
			<li role="presentation" style="border-bottom:1px solid #dddddd;"><a data-toggle="tab" class="hidden" href="#comments"><i class="icon-comments-alt"></i>   نظرات</a></li>
			<li role="presentation" style="border-bottom:1px solid #dddddd;"><a data-toggle="tab" class="hidden" href="#pictures"><i class="icon-picture"></i>   تصاویر</a></li>
		</ul>
		<div class="tab-content my-tab-content">
			<div id="menu" class="tab-pane fade in active">	
				<div class="row">	
					@if(!empty($products)&&count($products)>0)
						@php $current_category="";@endphp
						<div class="col-md-3 hidden-sm hidden-xs" id="myScrollspy"> 
							<ul class="nav nav-pills nav-stacked" id="affix2" data-spy="affix" data-offset-top="290">
								@foreach ($products as $food)
									@if($food->category_title!=$current_category)
										<li><a href="#{{$food->category_id}}">{{$food->category_title}}</a></li>
										@php $current_category=$food->category_title; @endphp
									@endif
								@endforeach
							</ul>
						</div>
					@else
						<div style="padding:0px 25px 0px 25px;">
							<br><div class="alert alert-warning well-sm hidden-xs" role="alert">تا کنون هیچ غذایی توسط این رستوران ثبت نشده است</div>
							<br><div class="alert alert-warning well-sm visible-xs" role="alert">این رستوران فاقد منو است</div>
						</div>
					@endif
					<div class="col-md-9">
						@if(!empty($products)&&count($products)>0)
							@php $i=0;$current_category="";@endphp
							@foreach ($products as $food)
								@if($food->hidden==0)
									@if($food->category_title!=$current_category)
										<div class="col-md-12 food-category-title" id="{{$food->category_id}}" style="padding-top:45px;">
											<span>{{$food->category_title."   "}}</span>
										</div>
										@php $current_category=$food->category_title; @endphp
									@endif
									<div class="col-md-12" style="padding:0px;">
										<div class="row food-container">
											<div class="col-md-1 col-sm-2 hidden-xs food-pic">
												<a href="{{ URL::asset('../public/storage/'.$food->picture)}}" data-lightbox="{{$food->id}}" data-title="{{$food->name}}"><i class="icon-camera"></i></a>
											</div>
											<div class="col-md-11 col-sm-11 col-xs-12" >
												<div class="col-md-7 col-sm-7 col-xs-6 food-name">
													@if($food->active==true)
														{{$food->name}}
													@else
														<s>{{$food->name}}</s><span style="color:#e74c3c;font-size:10px;"> تمام شد!</span>
													@endif
												</div>
												@if($restaurant->active==true and $food->active==true and $restaurant->status==true)
													<div class="col-md-4 col-sm-4 col-xs-4 food-price text-left">{{number2farsi($food->price).' ریال '}}</div>
													<div class="col-md-1 col-sm-1 col-xs-1 food-add" id="anim_{{$food->id}}">
														<a id="{{$food->id}}" onClick = "cartAction('add','{{$restaurant->id}}','{{$food->id}}'); add_anim(this);"><i class="icon-plus"></i></a>
													</div>
												@else
													<div class="col-md-5 col-sm-5 col-xs-5 food-price text-left">{{number2farsi($food->price).' ریال '}}</div>
												@endif
												<div class="hidden-xs food-details">
													<span>{{$food->details}}<span>
												</div>
											</div>
											
										</div>
										<hr class="food-divider" style="margin:5px 0px 5px 0px;">
									</div>
								@endif
							@endforeach
						@endif
					</div>
				</div>
			</div>	
			<div id="information" class="tab-pane fade">
				<div class="restaurant-info-tab">
					<div class="col-md-6 col-sm-12 col-xs-12">
						<div class="title">مشخصات رستوران</div>					
						<div class="col-md-1 col-sm-1 hidden-xs info-c1"><i class="icon-time"></i></div>
						<div class="col-md-4 col-sm-3 col-xs-6 info-c2">شروع سرو ناهار</div>
						<div class="col-md-7 col-sm-8 col-xs-6 info-c3">{{number2farsi2(substr($restaurant->lunch_start,0,-3))}} الی {{number2farsi2(substr($restaurant->lunch_end,0,-3))}}</div>
									
						<div class="col-md-1 col-sm-1 hidden-xs info-c1"><i class="icon-time"></i></div>
						<div class="col-md-4 col-sm-3 col-xs-6 info-c2">شروع سرو شام</div>
						<div class="col-md-7 col-sm-8 col-xs-6 info-c3">{{number2farsi2(substr($restaurant->dinner_start,0,-3))}} الی {{number2farsi2(substr($restaurant->dinner_end,0,-3))}}</div>
							
						<div class="col-md-1 col-sm-1 hidden-xs info-c1"><i class="icon-truck"></i></div>
						<div class="col-md-4 col-sm-3 col-xs-6 info-c2">مدت زمان تحویل</div>
						<div class="col-md-7 col-sm-8 col-xs-6 info-c3">{{number2farsi2($restaurant->deliver_time)}}</div>
								
						<div class="col-md-1 col-sm-1 hidden-xs info-c1"><i class="icon-money"></i></div>
						<div class="col-md-4 col-sm-3 col-xs-6 info-c2">هزینه پیک</div>
						<div class="col-md-7 col-sm-8 col-xs-6 info-c3">
							@if($restaurant->deliver_fee >0) 
								{{number2farsi($restaurant->deliver_fee)}} ریال
							@else
								رایگان
							@endif
						</div>
							
						<div class="col-md-1 col-sm-1 hidden-xs info-c1"><i class="icon-map-marker"></i></div>
						<div class="col-md-4 col-sm-3 hidden-xs col-xs-6 info-c2">آدرس</div>
						<div class="col-md-7 col-sm-8 hidden-xs col-xs-6 info-c3">{{$restaurant->address}}</div>
								
						<div class="col-md-1 col-sm-1 hidden-xs info-c1"><i class="icon-bolt"></i></div>
						<div class="col-md-4 col-sm-3 col-xs-6 info-c2">تخفیف</div>
						<div class="col-md-7 col-sm-8 col-xs-6 info-c3">
							@if($restaurant->discount >0) 
								{{number2farsi2($restaurant->discount)}} درصد
							@else
								ندارد
							@endif
						</div>
						
						<div class="col-md-1 col-sm-1 hidden-xs info-c1"><i class="icon-info"></i></div>
						<div class="col-md-4 col-sm-3 col-xs-6 info-c2">حداقل سفارش</div>
						<div class="col-md-7 col-sm-8 col-xs-6 info-c3">
							@if($restaurant->min_order >0) 
								{{number2farsi($restaurant->min_order)}} ریال
							@else
								ندارد
							@endif
						</div>
					</div>
					<div class="col-md-6 hidden-sm hidden-xs">
						<div class="title">آدرس روی نقشه</div>	
						<div id="map" style="height:200px"></div>
					</div>
				</div>
			</div>
			<div id="comments" class="tab-pane fade">
				به زودی
			</div>
			<div id="pictures" class="tab-pane fade">
				به زودی
			</div>
		</div>	    
	</div>

	<div class="col-md-3 hidden-sm hidden-xs" style="">
		<div class="cart-side" id="affix1" data-spy="affix" data-offset-top="235" data-offset-bottom="110" style="width:263px;">
			<center><i class="icon-shopping-cart cart-side-icon"></i></center>
			<div id="cart-item" class="panel-body" style="padding:0px 0px 15px 0px;">
	
			</div>
		</div>
	</div>
	<div class="visible-sm visible-xs col-xs-12 col-sm-12">
		<div class="cart-side">
			<center><i class="icon-shopping-cart cart-side-icon"></i></center>
			<div id="cart-item-mt" class="panel-body" style="padding:0px 0px 15px 0px;">
	
			</div>
		</div>
	</div>
	
	<script>
		$(document).ready(function () {
			cartAction('initial','<?php echo $restaurant->id;?>');
			$("#stars").rating();
		})
		function add_anim(caller){
			"use strict";
			var element = document.getElementById("anim_"+caller.id);
			caller.preventDefault;
			element.classList.remove("anim");
			void element.offsetWidth;
			element.classList.add("anim");
        }
		$('a[href="#information"]').on('shown.bs.tab', function(e){
			google.maps.event.trigger(map, 'resize');
			initMap();
		});
	</script>
	<script>
		var marker;
		function initMap() {
		  var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 15,
			center: {lat: <?php echo $restaurant->latitude;?>, lng: <?php echo $restaurant->longitude;?>}
		  });
		  marker = new google.maps.Marker({
			map: map,
			draggable: true,
			animation: google.maps.Animation.DROP,
			position: {lat: <?php echo $restaurant->latitude;?>, lng: <?php echo $restaurant->longitude;?>}
		  });
		  marker.addListener('click', toggleBounce);
		}
		function toggleBounce() {
		  if (marker.getAnimation() !== null) {
			marker.setAnimation(null);
		  } else {
			marker.setAnimation(google.maps.Animation.BOUNCE);
		  }
		}
    </script>
	<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCM0vKXlTiUWll-8YAd7_UovUbgR2Wta7M&callback=initMap"></script>

@endsection
<?php
	function number2farsi2($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		return str_replace($en_num, $fa_num, $string);
	}
?>

@extends('layouts.internal')
@section('title', '- رستورانهای منطقه '.$area->name.' همدان')
@section('seo')
	<meta name="description" content="رستورانهای تحت پوشش راحت فود در منطقه {{$area->name}} همدان">
	<meta name="keywords" content="سفارش, سفارش غذا, سفارش اینترنتی غذا, سفارش آنلاین غذا, سفارش غذا همدان,رستورانهای همدان, رستورانهای {{$area->name}} همدان">
@endsection

@section('top')
    <div class="area-top" style="background:url({{ URL::asset('../public/storage/'.$area->cover) }}) no-repeat center;background-size:cover;">
		<div class="container">
			<div class="row internal-search-form">
				<div class="text-center">
					<h5 style="color:#fff;">رستورانهای تحت پوشش سرویس {{config('app.name')}} در محدوده {{$area->name}}</h5>
					<div class="col-md-6 col-md-offset-3">
						<form class="search-form">
							<input type="text" id="tags" class="form-control input-lg" placeholder="نام منطقه (مثال: بلوار مدنی)" required />
						</form>
					</div>
					<div class="col-md-1 text-right col-sm-1 hidden-xs auto-location"><a title="مکان یابی خودکار" onclick="getLocation();"><i class="icon-map-marker"></i></a></div>
				</div>
			</div>
		</div>
	</div>
@endsection

@section('content')
	<div class="col-md-12 hidden-xs">
		<ol class="breadcrumb">
			<li><a href="{{url('/home')}}"><i class="icon-home"></i></a></li>
			<li class="active">محدوده {{$area->name}}</li>
		</ol>
	</div>
	<div class="col-md-12">
		@foreach ($restaurants as $restaurant)
			<div class="col-md-3 col-sm-6 col-xs-12 area-padding" >
				<a href="{{url('/area/'.$area->id.'/restaurant/'.$restaurant->id.'/'.$restaurant->name)}}">
					<div class="restaurant-container">
						<div class="text-center">
							@if($restaurant->deliver_fee ==0)
								<span class="label my-label free">پیک رایگان</span>
								<center><div class="logo" style="background:url('{{ URL::asset('storage/'.$restaurant->logo) }}') no-repeat center;background-size: 110px 110px;margin-top:-15px;"></div></center>
							@else
								<span> </span>
								<center><div class="logo" style="background:url('{{ URL::asset('storage/'.$restaurant->logo) }}') no-repeat center;background-size: 110px 110px;margin-top:11px;"></div></center>
							@endif	
							
							<div class="name">{{$restaurant->name}}</div>
							<div class="address"><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span> {{$restaurant->address}}</div>
							<div class="col-md-8 col-md-offset-2 col-sm-7 col-sm-offset-3 col-xs-7 col-xs-offset-2 my-stars">
								<input type="text" id="stars" name="stars" value="{{$restaurant->stars}}" class="rating" data-min=0 data-max=5 data-step=0.1 data-rtl="true" data-container-class='text-right' data-glyphicon=0 readonly />
							</div>
							@if($restaurant->active==true and $restaurant->status==true)
								<h5>
									<span class="label my-label open">سفارش می پذیرد</span> 
									@if($restaurant->discount>0)
										<span class="label my-label discount">{{number2farsi2($restaurant->discount)}}% تخفیف</span>
									@else
										<span> </span>
									@endif
								</h5>
							@elseif($restaurant->active==true and $restaurant->status==false)
								<h5>
									<span class="label my-label closed">خارج از ساعت سفارش</span>
									<span> </span>
								</h5>
							@else
								<h5><span class="label my-label closed">بسته است</span></h5>
							@endif
						</div>
					</div>
				</a>
			</div>
		@endforeach
	</div>
	<script>
		function getLocation() {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(showPosition);			
			}
		}
		function showPosition(position) {
			window.location="http://localhost/rahatfood/public/geo?lat="+position.coords.latitude+"&long="+position.coords.longitude;
		}
	</script>
@endsection
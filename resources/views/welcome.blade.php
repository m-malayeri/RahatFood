<?php
	function number2farsi2($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		return str_replace($en_num, $fa_num, $string);
	}
?>
@extends('layouts.landing')
@section('title', '- سفارش آنلاین غذا از رستورانهای خوب همدان')

@section('seo')
	<meta name="description" content="سرویس سفارش آنلاین غذا از رستورانهای شهر همدان. با کمک این سرویس در کوتاهترین زمان ممکن سفارش خود را از معتبرترین رستورانهای همدان ثبت کنید">
	<meta name="keywords" content="راحت فود, سفارش, سفارش غذا, سفارش اینترنتی غذا, سفارش آنلاین غذا, سفارش غذا همدان, رستورانهای همدان">
@endsection

@section('content')
	<section class="first-section">
		<div class="container-fluid">
			<div class="row">
				<div class="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
					<div class="text-center"><img src="{{ URL::asset('images/logo3.png') }}" alt="راحت فود لوگو" width="160" height="160" style="animation:spin2 1s;"></div>
					<h1 class="slogan"><strong>راحت فود</strong></h1>
					<h2 class="slogan l2">سفارش آنلاین غذا از رستورانهای خوب همدان</h2>	
					<form action="{{url('search_area')}}" method="get" class="search-form">
						<div class="col-md-11 col-sm-11"><input type="text" name="q" id="tags" class="form-control input-lg" placeholder="نام منطقه (مثال: بلوار مدنی)" required /></div>
						<div class="col-md-1 col-sm-1 hidden-xs auto-location"><a title="مکان یابی خودکار" onclick="getLocation();"><i class="icon-map-marker"></i></a></div>
						<div class="col-md-12" ><input style="font-size:16px;" type="submit" class="btn btn-lg btn-search" value="نمایش رستورانهای نزدیک"></div>
					</form>
					@if (Session::has('message'))
						<center><div class="col-md-12 alert alert-warning well-sm" role="alert" style="margin-top:15px;">{{ Session::get('message') }}</div></center>
					@endif
				</div>
				<div class="visible-xs text-center auto-location">
					<br>
					<a title="مکان یابی خودکار" onclick="getLocation();">مکان یابی خودکار <i class="icon-map-marker"></i></a>
				</div>
			</div>	
		</div>
	</section>
	<section class="guide-section">
		<div class="container">
			<div class="row">
				<div class="text-center">
					<div class="col-md-4 col-sm-4">
						<img src="{{ URL::asset('images/location.png') }}" alt="Generic image" width="128" height="128">
						<h4>{{number2farsi2('1')}}- کجا هستید؟</h4>
						<p>منوی رستورانهای اطراف محل زندگی خودتون رو ببینید</p>
					</div>
					<div class="col-md-4 col-sm-4">
						<img src="{{ URL::asset('images/food.png') }}" alt="Generic image" width="128" height="128">
						<h4>{{number2farsi2('2')}}- چی میل دارید؟</h4>
						<p>سفارش خودتون رو انتخاب و ثبت کنید</p>
					</div>
					<div class="col-md-4 col-sm-4">
						<img src="{{ URL::asset('images/delivery.png') }}" alt="Generic image" width="128" height="128">
						<h4>{{number2farsi2('3')}}- سفارشتون توی راهه!</h4>
						<p>منتظر باشید تا پیک رستوران، سفارشتون رو به دستتون برسونه</p>
					</div>
				</div>
			</div>
		</div>
	</section>
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

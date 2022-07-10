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
	$cart_total=0;
	$VAT=0;
	$discount=0;
	$cart=session()->get('shopping_cart_'.$vendor->id);
?>

@extends('layouts.internal')
@section('title', '- مشخصات تحویل گیرنده')
@section('content')
	<div class="col-md-12">
		<ol class="breadcrumb hidden-xs">
			<li><a href="{{url('/home')}}"><i class="icon-home"></i></span></a></li>
			@if(Auth::check())
				<li><a href="{{url('/panel')}}">پنل کاربری</a></li>
			@endif
			<li class="active">ورود مشخصات</li>
		</ol>
	</div>
	
	<p></p>
	<div class="col-md-9 col-sm-12 col-xs-12">
		@php 
			if(Auth::check())
				$url=url('/user_order');
			else
				$url=url('/guest_order');
		@endphp
		<div class="panel panel-primary">
			<div class="panel-heading cart-heading"><div class="panel-title">مشخصات تحویل گیرنده سفارش</div></div>
			<div class="panel-body cart-panel">
				@if(Auth::guest())
					<div class="guest-mode" style="">
						<span>
							<i class="icon-bullhorn icon-flip-horizontal"></i>   کاربر گرامی، در صورتی که عضو سرویس راحت فود هستید، وارد حساب کاربری خود شوید.    
							<a href="{{url('/login')}}"><button class="btn btn-sm btn-success my-login">ورود</button></a>
						</span>
					</div>
				@endif
				@if (Session::has('errors'))
					<div class="col-md-12 alert alert-danger well-sm" role="alert">موارد خواسته شده را به صورت صحیح وارد نمایید</div>
				@endif
				<form action="{{$url}}" method="post" class="cart-form">
					{{ csrf_field() }}
					<input type="hidden" name="vendor_id" value="{{$vendor->id}}"/>
					@if(Auth::check())
						<i class="icon-user"></i> نام و نام خانوادگی: 
						<div class="cart-user-info"><h5>{{Auth::user()->name}}</h5></div>
						<i class="icon-phone icon-flip-horizontal"></i> شماره تلفن همراه: 
						<div class="cart-user-info"><h5>{{number2farsi2(Auth::user()->phone)}}</h5><br></div>
						@if(Auth::user()->address==null)
							<input type="radio" name="address" value="new_addr" checked />
							به این آدرس ارسال کن<br>
							<div class="row">
								<div class="col-md-12 cart-input-address">
									<div class="input-group input-group-lg">
										<span class="input-group-addon" id="sizing-addon4"><div class="my-addon"><i class="icon-home"></i></div></span>
										<input type="text" class="form-control" name="user_address" placeholder="آدرس" aria-describedby="sizing-addon4" required/>
									</div>
								</div>
							</div>
							<br><h6>توجه: کاربر گرامی، تاکنون آدرس خود را ثبت ننموده اید، در صورت تمایل برای ذخیره آدرس می توانید از طریق پنل کاربری/ویرایش اطلاعات اقدام نمایید</h6>
						@else
							<input type="radio" name="address" value="current_addr" checked />
							از آدرس فعلی من استفاده کن:
							<div class="cart-user-info"><h5>{{Auth::user()->address}}</h5></div>
							<input type="radio" name="address" value="new_addr">
							یا به این آدرس ارسال کن:<br>
							<div class="row">
								<div class="col-md-11 col-xs-12 cart-input-address">
									<div class="input-group input-group-lg">
										<span class="input-group-addon" id="sizing-addon4"><div class="my-addon"><i class="icon-home"></i></div></span>
										<input type="text" class="form-control" name="user_address" placeholder="آدرس" aria-describedby="sizing-addon4" />
									</div>
								</div>
							</div>													
						@endif	
					@else
						<div class="row">
							<div class="col-md-6 cart-input" >
								<div class="input-group input-group-lg {{ $errors->has('name') ? ' has-error' : '' }}">
									<span class="input-group-addon" id="sizing-addon1"><div class="my-addon"><i class="icon-user"></div></i></span>
									<input type="text" class="form-control" name="name" placeholder="نام و نام خانوادگی" aria-describedby="sizing-addon1" value="{{old('name')}}" required/>
								</div>
							</div>
							<div class="col-md-6 cart-input">
								<div class="input-group input-group-lg {{ $errors->has('phone') ? ' has-error' : '' }}">
									<span class="input-group-addon" id="sizing-addon2"><div class="my-addon"><i class="icon-phone icon-flip-horizontal"></i></div></span>
									<input type="text" class="form-control" name="phone" placeholder="شماره تلفن همراه" aria-describedby="sizing-addon2" value="{{old('phone')}}" required />
								</div>
								@if ($errors->has('phone'))
									<div class="auth-notifier">{{ $errors->first('phone') }}</div>
								@endif	
							</div>
						</div>
						<div class="row hidden">
							<div class="col-md-6 cart-input">
								<div class="input-group input-group-lg {{ $errors->has('email') ? ' has-error' : '' }}">
									<span class="input-group-addon" id="sizing-addon3"><div class="my-addon">@</div></span>
									<input type="text" class="form-control" name="email" placeholder="آدرس ایمیل - اختیاری" aria-describedby="sizing-addon3" value="{{old('email')}}" />
								</div>
								@if ($errors->has('email'))
									<div class="auth-notifier">{{ $errors->first('email') }}</div>
								@endif	
							</div>
						</div>
						<div class="row">
							<div class="col-md-12 cart-input-address">
								<div class="input-group input-group-lg {{ $errors->has('user_address') ? ' has-error' : '' }}">
									<span class="input-group-addon" id="sizing-addon4"><div class="my-addon"><i class="icon-home"></i></div></span>
									<input type="text" class="form-control" name="user_address" placeholder="آدرس" aria-describedby="sizing-addon4" value="{{old('user_address')}}" required/>
								</div>
								<h5>توجه: در صورت ثبت سفارش به صورت موفقیت آمیز، پیامک تایید به شما ارسال خواهد شد.</h5>
							</div>
						</div>
					@endif
					
					@if(Auth::check())
						<input type="radio" name="payment_method" value="online" />
						پرداخت آنلاین با درگاه بانکی (نکست پی)
						<br> 
					@endif
					<input type="radio" name="payment_method" value="cash" checked />
					پرداخت پس از تحویل درب منزل
					<br>
					@if(Auth::check())					
						<h5>توجه: در صورت انتخاب <strong>پرداخت آنلاین</strong>، پس از ثبت سفارش بایستی صورتحساب خود را از طریق پنل کاربری خود پرداخت نمایید</h5>										
					@else
						<h5>توجه: قابلیت پرداخت آنلاین صرفاً برای کاربران ثبت نام شده فعال است.</h5>
					@endif
					<br>
					<div class="col-md-8 form-group">
						<label for="address">چنانچه پیشنهادی درباره نحوه ارسال سفارش دارید، در این کادر وارد نمایید</label>
						<textarea class="form-control" name="comment" rows="4"></textarea>
						<div style="color:#e74c3c;margin-top:20px;">
							هزینه پیک: 
							@if($vendor->deliver_fee > 0)
								{{number2farsi($vendor->deliver_fee)}} ریال
								<br>
								<h6>توجه: هزینه پیک به صورت جداگانه و هنگام تحویل سفارش اخذ خواهد شد</h6>
							@else
								رایگان
							@endif
						</div>
						@if(Auth::guest())
							<h6>توجه: با ثبت سفارش، موافقت خود را با <a href="{{url('/info#terms')}}" target="_blank">قوانین و مقررات</a> اعلام می نمایید.</h6>
						@endif
						<input type="submit" class="btn btn-md btn-success my-checkout" value="ثبت سفارش" /><br>
					</div>
				</form>
			</div>
		</div>
	</div>	
	<div class="col-md-3 col-sm-12 col-xs-12" style="margin-bottom:15px;">
		<div class="cart-side">
			<center><i class="icon-shopping-cart cart-side-icon"></i></center>
			<div id="cart-item" class="panel-body" style="padding:0px 0px 15px 0px;">
				@if(!empty($cart)) 
					@foreach($cart as $item)
						@php
							$id=$item["id"];
							$row_price=$item["quantity"]*$item["price"];
							$quantity=number2farsi($item["quantity"]);
							$cart_total+=$row_price;
							if($vendor->VAT==true)
								$VAT=($cart_total*9)/100;
							if($vendor->discount >0)
								$discount=($cart_total * $vendor->discount)/100;
							$after_cart_total=($cart_total + $VAT) - $discount;
						@endphp
						<div class="col-md-12 col-sm-12 col-xs-12">
							<div class="little-cart-container">
								<div class="col-md-9 col-sm-9 col-xs-9 text-right food-name">{{$item["name"]}}</div>
								<div class="col-md-3 col-sm-3 col-xs-3 text-left food-quantity"><span class="badge">{{$quantity}}</span></div>
								<div class="col-md-12 col-sm-12 col-xs-12 food-price">{{number2farsi($row_price)}} ریال</div>
							</div>
						</div>
					@endforeach	
					<div class="col-md-12 col-sm-12 col-xs-12 my-calc">
						<div class="col-md-5 col-sm-6 col-xs-5 c1">مجموع سفارش</div>
						<div class="col-md-7 col-sm-6 col-xs-7 c2">{{number2farsi($cart_total)}} ریال</div>
						@if($vendor->VAT==true)
							<div class="col-md-6 col-sm-6 col-xs-6 c1">+ مالیات ({{number2farsi('9')}}%)</div>
							<div class="col-md-6 col-sm-6 col-xs-6 c2">{{number2farsi($VAT)}} ریال</div>
						@endif
						@if($vendor->discount >0)
							<div class="col-md-5 col-sm-6 col-xs-5 c1">- تخفیف</div>
							<div class="col-md-7 col-sm-6 col-xs-7 c2">{{number2farsi($discount)}} ریال</div>
						@endif
					</div>
					<div class="col-md-12">
						<div class="final-price">
							<div class="col-md-5 col-sm-6 col-xs-5">مبلغ نهایی</div>
							<div class="col-md-7 col-sm-6 col-xs-7 text-left" style="color:#16a085">{{number2farsi($after_cart_total)}} ریال</div>
						</div>
					</div>
				@else
					<center><br><h5>سبد خرید شما خالی است</h5><br></center>
				@endif				
			</div>
		</div>
	</div>
@endsection
<?php
	function number2farsi2($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		return str_replace($en_num, $fa_num, $string);
	}
	function number2farsi($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		$string=number_format($string, 0, ',', ',');
		return str_replace($en_num, $fa_num, $string);
	}
?>

@extends('layouts.vendor-dashboard')
@section('title', '- داشبورد مدیریت- ویرایش اطلاعات')
@section('content')
	<div class="row">
		<div class="col-md-12 col-sm-12 col-xs-12"> 
			<br>
			<div class="x_panel tile">
				<div class="x_title">
					<h4>فرم ویرایش اطلاعات رستوران</h4>
					<div class="clearfix"></div>
				</div>
				<div class="x_content">
					<br>
					<div class="col-md-4">
						<form action="{{url('vendor/edit')}}" method="post" class="add-product-form">
							{{ csrf_field() }}
							<div class="form-group {{ $errors->has('lunch_start') ? ' has-error' : '' }}">
								<label for="lunch_start">شروع سرو ناهار</label>
								<input type="time" name="lunch_start" class="form-control" placeholder="شروع سرو ناهار" value="{{$vendor->lunch_start}}" required />
								@if ($errors->has('lunch_start'))
									<div class="auth-notifier">{{ $errors->first('lunch_start') }}</div>
								@endif	
							</div>
							<div class="form-group {{ $errors->has('lunch_end') ? ' has-error' : '' }}">
								<label for="lunch_end">پایان سرو ناهار</label>
								<input type="time" name="lunch_end" class="form-control" placeholder="پایان سرو ناهار" value="{{$vendor->lunch_end}}" required />
								@if ($errors->has('lunch_end'))
									<div class="auth-notifier">{{ $errors->first('lunch_end') }}</div>
								@endif	
							</div>
							<div class="form-group {{ $errors->has('dinner_start') ? ' has-error' : '' }}">
								<label for="dinner_start">شروع سرو شام</label>
								<input type="time" name="dinner_start" class="form-control" placeholder="شروع سرو شام" value="{{$vendor->dinner_start}}" required />
								@if ($errors->has('dinner_start'))
									<div class="auth-notifier">{{ $errors->first('dinner_start') }}</div>
								@endif	
							</div>
							<div class="form-group {{ $errors->has('dinner_end') ? ' has-error' : '' }}">
								<label for="dinner_end">پایان سرو شام</label>
								<input type="time" name="dinner_end" class="form-control" placeholder="پایان سرو شام" value="{{$vendor->dinner_end}}" required />
								@if ($errors->has('dinner_end'))
									<div class="auth-notifier">{{ $errors->first('dinner_end') }}</div>
								@endif	
							</div>
							<div class="form-group {{ $errors->has('discount') ? ' has-error' : '' }}">
								<label for="discount">تخفیف (درصد)</label>
								<input type="text" name="discount" class="form-control" placeholder="تخفیف" value="{{$vendor->discount}}"/>
								@if ($errors->has('discount'))
									<div class="auth-notifier">{{ $errors->first('discount') }}</div>
								@endif								
							</div>
							<div class="form-group {{ $errors->has('deliver_time') ? ' has-error' : '' }}">
								<label for="deliver_time">مدت زمان تحویل</label>
								<input type="text" name="deliver_time" class="form-control" placeholder="مدت زمان تحویل" value="{{$vendor->deliver_time}}"/>
								@if ($errors->has('deliver_time'))
									<div class="auth-notifier">{{ $errors->first('deliver_time') }}</div>
								@endif	
							</div>
							<div class="form-group {{ $errors->has('deliver_fee') ? ' has-error' : '' }}">
								<label for="deliver_fee">هزینه پیک (ریال)</label>
								<input type="text" name="deliver_fee" class="form-control" placeholder="هزینه پیک" value="{{$vendor->deliver_fee}}"/>
								@if ($errors->has('deliver_fee'))
									<div class="auth-notifier">{{ $errors->first('deliver_fee') }}</div>
								@endif	
							</div>
							<div class="form-group {{ $errors->has('min_order') ? ' has-error' : '' }}">
								<label for="min_order">حداقل سفارش (ریال)</label>
								<input type="text" name="min_order" class="form-control" placeholder="حداقل سفارش" value="{{$vendor->min_order}}"/>
								@if ($errors->has('min_order'))
									<div class="auth-notifier">{{ $errors->first('min_order') }}</div>
								@endif	
							</div>
							<input type="submit" class="btn btn-sm btn-success my-checkout" value="به روزرسانی" />
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
@endsection

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
@section('title', '- داشبورد مدیریت- ویرایش آیتم')
@section('content')
	<div class="row">
		<div class="col-md-12 col-sm-12 col-xs-12"> 
			<br>
			<div class="x_panel tile">
				<div class="x_title">
					<h4>فرم ویرایش آیتم</h4>
					<div class="clearfix"></div>
				</div>
				<div class="x_content">
					<br>
					<div class="col-md-4">
						<form action="{{url('vendor/products/'.$product->id)}}" method="post" class="add-product-form">
							{{ csrf_field() }}
							{{ method_field('PUT') }}
							<div class="form-group {{ $errors->has('name') ? ' has-error' : '' }}">
								<label for="name">نام</label>
								<input type="text" name="name" class="form-control" placeholder="نام غذا" value="{{$product->name}}" required />
								@if ($errors->has('name'))
									<div class="auth-notifier">{{ $errors->first('name') }}</div>
								@endif	
							</div>
							<div class="form-group {{ $errors->has('price') ? ' has-error' : '' }}">
								<label for="price">قیمت به ریال</label>
								<input type="text" name="price" class="form-control" placeholder="قیمت به ریال" value="{{$product->price}}" required />
								@if ($errors->has('price'))
									<div class="auth-notifier">{{ $errors->first('price') }}</div>
								@endif	
							</div>
							<div class="form-group {{ $errors->has('details') ? ' has-error' : '' }}">
								<label for="details">توضیحات (اختیاری)</label>
								<input type="text" name="details" class="form-control" placeholder="توضیحات" value="{{$product->details}}" />
								@if ($errors->has('details'))
									<div class="auth-notifier">{{ $errors->first('details') }}</div>
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

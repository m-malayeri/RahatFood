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
@section('title', '- داشبورد مدیریت- منوی رستوران')
@section('content')
	@if (Session::has('message'))
		<div class="col-md-12 alert alert-success well-sm" role="alert" style="margin-top:15px;">{{ Session::get('message') }}</div>
	@endif
	@if (Session::has('error'))
		<div class="col-md-12 alert alert-danger well-sm" role="alert" style="margin-top:15px;">{{ Session::get('error') }}</div>
	@endif
	<div class="row">
		<div class="col-md-12 col-sm-12 col-xs-12">
			<br>
			<div class="x_panel tile">
				<div class="x_title">
					<h4>آمار منوی رستوران</h4>
					<div class="clearfix"></div>
				</div>
				<div class="x_content">
					<div class="tile_count">
						<div class="col-md-4 col-sm-4 col-xs-12 tile_stats_count">
							<h4>تعداد غذای کل</h4>
							@if(count($products)>0)
								<h5>{{number2farsi2(count($products))}}  غذا</h5>
							@else
								<h5>صفر غذا</h5>
							@endif
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-12 col-sm-12 hidden-xs">
			<br>
			<div class="x_panel tile">
				<div class="x_title">
					<h4>منوی رستوران</h4>
					<div class="clearfix"></div>
				</div>
				<div class="x_content">
					@if(count($products)>0)
						<table class="table table-hover" id="cart-table">
							<thead>
								<tr class="success">
									<th>ردیف</th>
									<th>نام غذا</th>
									<th>قیمت</th>
									<th>دسته بندی</th>
									<th>توضیحات</th>
									<th>وضعیت</th>
									<th>موجود/ناموجود</th>
									<th>ویرایش</th>
									<th>مخفی/نمایش</th>
								</tr>
							</thead>
							<tbody>
								@php $i=1; @endphp
								@foreach ($products as $product)
									<tr>
										<td>{{number2farsi2($i)}}</td>
										<td>{{$product->name}}</td>
										<td>{{number2farsi($product->price)}} ریال</td>
										<td>{{$product->category_title}}</td>
										<td>{{$product->details}}</td>
										@if($product->active==1)
											<td>موجود</td>
											<td><a href="{{url('/vendor/products/unavailable/'.$product->id)}}"><i class="icon-minus-sign vendor-op-sign red"></i></a></td>
										@else
											<td style="color:#e74c3c;">نا موجود</td>
											<td><a href="{{url('/vendor/products/available/'.$product->id)}}"><i class="icon-plus vendor-op-sign green"></i></a></td>
										@endif
										<td><a href="{{url('/vendor/products/'.$product->id.'/edit')}}"><i class="icon-edit vendor-op-sign blue"></i></a></td>
										@if($product->hidden==1)
											<td><a href="{{url('/vendor/products/'.$product->id.'/unhide')}}"><i class="icon-eye-open vendor-op-sign green"></i></a></td>
										@else
											<td><a href="{{url('/vendor/products/'.$product->id.'/hide')}}"><i class="icon-eye-close vendor-op-sign green"></i></a></td>
										@endif
									</tr>
									@php $i++; @endphp
								@endforeach
							</tbody>
						</table>
					@else
						<div class="alert alert-warning well-sm" role="alert" style="margin-top:15px;">تا کنون هیچ غذایی توسط این واحد ثبت نشده است</div>
					@endif
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-12 col-sm-12 col-xs-12"> 
			<br>
			<div class="x_panel tile">
				<div class="x_title">
					<h4>فرم افزودن غذا</h4>
					<div class="clearfix"></div>
				</div>
				<div class="x_content">
					<br>
					<div class="col-md-4">
						<form action="{{url('vendor/products')}}" method="post" class="add-product-form" enctype="multipart/form-data">
							{{ csrf_field() }}
							<input type="hidden" name="vendor_id" value="{{$vendor->id}}">
							<div class="form-group {{ $errors->has('name') ? ' has-error' : '' }}">
								<label for="name">نام آیتم</label>
								<input type="text" name="name" class="form-control" placeholder="نام آیتم" required />
								@if ($errors->has('name'))
									<div class="auth-notifier">{{ $errors->first('name') }}</div>
								@endif	
							</div>
							<div class="form-group {{ $errors->has('price') ? ' has-error' : '' }}">
								<label for="price">قیمت (به ریال)</label>
								<input type="text" name="price" class="form-control" placeholder="قیمت (به ریال)" required />
								@if ($errors->has('price'))
									<div class="auth-notifier">{{ $errors->first('price') }}</div>
								@endif	
							</div>
							<div class="form-group {{ $errors->has('details') ? ' has-error' : '' }}">
								<label for="details">توضیحات</label>
								<input type="text" name="details" class="form-control" placeholder="توضیحات" />
								@if ($errors->has('details'))
									<div class="auth-notifier">{{ $errors->first('details') }}</div>
								@endif	
							</div>
							<select class="form-control select" name="category" >
								<option value="irani">غذای ایرانی</option>
								<option value="pizza">پیتزا</option>
								<option value="sandwich">ساندویچ</option>
								<option value="farangi">منوی فرنگی</option>
								<option value="drink">نوشیدنی</option>
							</select>
							<div class="form-group">
								<label for="food_pic">تصویر</label>
								<input type="file" name="product_pic">
							</div>
							<input type="submit" class="btn btn-sm btn-success my-checkout" value="ثبت">
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
@endsection


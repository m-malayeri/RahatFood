<?php
	function number2farsi2($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		return str_replace($en_num, $fa_num, $string);
	}
?>
@extends('layouts.admin-dashboard')
@section('title', '- داشبورد مدیریت- رستورانها')
@section('content')
	@if (Session::has('message'))
		<div class="col-md-12 alert alert-success well-sm" role="alert" style="margin-top:15px;">{{ Session::get('message') }}</div>
	@endif
	<div class="tile_count">
		<div class="col-md-4 col-sm-4 col-xs-12 tile_stats_count">
			<h4><i class="icon-food"></i>  تعداد کل رستورانها</h4>
			<h5>{{number2farsi2($reports["total_vendors"])}}  رستوران</h5>
		</div>
		<div class="col-md-4 col-sm-4 col-xs-12 tile_stats_count">
			<h4>تعداد غذای کل</h4>
			<h5>{{number2farsi2($reports["total_foods"])}}  غذا</h5>
		</div>
	</div><!-- /top tiles -->
	<div class="row">
		<div class="col-md-12 col-sm-12 hidden-xs"> 
			<br>
			<div class="x_panel tile">
				<div class="x_title">
					<h4>لیست رستورانها</h4>
					<div class="clearfix"></div>
				</div>
				<div class="x_content">
					<table class="table table-hover" id="cart-table">
						<thead>
							<tr class="success">
								<th>ردیف</th>
								<th>نام رستوران</th>
								<th>آدرس</th>
								<th>سود</th>
								<th>تخفیف</th>
								<th>وضعیت</th>
								<th>ناهار</th>
								<th>شام</th>
							</tr>
						</thead>
						<tbody>
							@php $i=1; @endphp
							@foreach ($restaurants as $restaurant)
								<tr>
									<td>{{number2farsi2($i)}}</td>
									<td>{{$restaurant->name}}</td>
									<td>{{$restaurant->address}}</td>
									<td>{{number2farsi2($restaurant->profit)}} %</td>
									<td>{{number2farsi2($restaurant->discount)}} %</td>
									@if($restaurant->active==1)
										<td>باز</td>
									@else
										<td>بسته</td>
									@endif
									<td>{{number2farsi2($restaurant->lunch_start)}} الی {{number2farsi2($restaurant->lunch_end)}}</td>
									<td>{{number2farsi2($restaurant->dinner_start)}} الی {{number2farsi2($restaurant->dinner_end)}}</td>
								</tr>
								@php $i++; @endphp
							@endforeach
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-12 col-sm-12 col-xs-12"> 
			<br>
			<div class="x_panel tile">
				<div class="x_title">
					<h4>فرم افزودن رستوران</h4>
					<div class="clearfix"></div>
				</div>
				<div class="x_content">
					<br>
					<form action="{{url('admin/restaurants/add')}}" method="post" class="form-inline add-rest-form" enctype="multipart/form-data">
						{{ csrf_field() }}
						<input type="text" name="id" class="form-control" placeholder="آیدی واحد" required>
						<input type="text" name="name" class="form-control" placeholder="عنوان واحد" required>
						<input type="text" name="manager" class="form-control" placeholder="آیدی مدیر" required>
						<input type="text" name="address" class="form-control" placeholder="آدرس" required>
						<input type="text" name="profit" class="form-control" placeholder="سود پرداختی" required>
						<input type="text" name="discount" class="form-control" placeholder="تخفیف" required>
						<input type="text" name="deliver_time" class="form-control" placeholder="زمان تحویل" required>
						<input type="text" name="deliver_fee" class="form-control" placeholder="هزینه پیک" required>
						
						<br><br>
						<div class="form-group">
							<label for="lunch_start">شروع سرو ناهار</label>
							<input type="time" name="lunch_start" class="form-control" placeholder="شروع سرو ناهار" required>
						</div>
						
						<div class="form-group">
							<label for="lunch_end">پایان سرو ناهار</label>
							<input type="time" name="lunch_end" class="form-control" placeholder="پایان سرو ناهار" required>
						</div>
						<br>
						<div class="form-group">
							<label for="dinner_start">شروع سرو شام</label>
							<input type="time" name="dinner_start" class="form-control" placeholder="شروع سرو شام" required>
						</div>
						
						<div class="form-group">
							<label for="dinner_end">پایان سرو شام</label>
							<input type="time" name="dinner_end" class="form-control" placeholder="پایان سرو شام" required>
						</div>
						
						<br><br>
						<div class="form-group">
							<label for="cover">کاور صفحه رستوران</label>
							<input type="file" name="cover">
						</div>
						<div class="form-group">
							<label for="logo">لوگوی رستوران</label>
							<input type="file" name="logo">
						</div>
						<br><br>
						
						مناطق تحت پوشش
						<br>
						@foreach($areas as $area)
							<div class="form-group col-md-3" style="background-color:#ecf0f1;margin-bottom:5px;">
								<label>{{$area->name}}</label>
								<input type="checkbox" name="{{$area->id}}" value="1">
							</div>
						@endforeach
						
						<br><br>
						<input type="submit" class="btn btn-sm btn-success" value="ثبت رستوران">
					</form>
				</div>
			</div>
		</div>
	</div>
@endsection

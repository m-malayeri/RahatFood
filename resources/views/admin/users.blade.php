<?php
	function number2farsi2($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		return str_replace($en_num, $fa_num, $string);
	}
?>
@extends('layouts.admin-dashboard')
@section('title', '- داشبورد مدیریت')
@section('content')
	@if (Session::has('message'))
		<div class="col-md-12 alert alert-success well-sm" role="alert" style="margin-top:15px;">{{ Session::get('message') }}</div>
	@endif
	<div class="tile_count">
		<div class="col-md-4 col-sm-4 col-xs-12 tile_stats_count">
			<h4><i class="icon-user"></i>  تعداد کل کاربران</h4>
			<h5>{{number2farsi2($reports["total_users"])}} کاربر</h5>
		</div>
	</div><!-- /top tiles -->
	
	<div class="row">
		<div class="col-md-12 col-sm-12 hidden-xs">
			<br>
			<div class="x_panel tile">
				<div class="x_title">
					<h4>لیست کاربران</h4>
					<div class="clearfix"></div>
				</div>
				<div class="x_content">
					<table class="table table-hover" id="cart-table">
						<thead>
							<tr class="success">
								<th>ردیف</th>
								<th>نام و نام خانوادگی</th>
								<th>ایمیل</th>
								<th>شماره تلفن همراه</th>
								<th>آدرس</th>
							</tr>
						</thead>
						<tbody>
							@php $i=1; @endphp
							@foreach ($total_users as $user)
								<tr>
									<td>{{number2farsi2($i)}}</td>
									<td>{{$user->name}}</td>
									<td>{{$user->email}}</td>
									<td>{{number2farsi2($user->phone)}}</td>
									<td>{{$user->address}}</td>
								</tr>
								@php $i++; @endphp
							@endforeach
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
@endsection

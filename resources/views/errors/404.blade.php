@extends('layouts.internal')
@section('title', '- صفحه مورد نظر در دسترس نیست')
@section('content')
	<div class="not-found hidden-xs">
		<div class="col-md-4 text-center">
			<i class="icon-frown"></i>
		</div>
		<div class="col-md-8">
			<h3>صفحه مورد نظر در دسترس نیست!</h3>	
			<h4>این صفحه ممکن است حذف یا منتقل شده باشد، لطفا مجددا آدرس صحیح را وارد نمایید</h4>
			<div class="links">
				<a href="{{url('/home')}}">صفحه اصلی</a>  |  
				<a href="{{url('/register')}}">ثبت نام</a>  |  
				<a href="{{url('/info#faq')}}">سوالات متداول</a>  |  
				<a href="{{url('/info#careers')}}">فرصتهای شغلی</a>
			</div>
		</div>
	</div>
	<div class="not-found visible-xs">
		<center><h5>صفحه مورد نظر در دسترس نیست!</h5></center>
	</div>
@endsection
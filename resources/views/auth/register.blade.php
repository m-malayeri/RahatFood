@extends('layouts.auth')
@section('title', '- ثبت نام')

@section('seo')
	<meta name="description" content="ثبت نام در راحت فود">
@endsection

@section('content')
	<img src="{{ URL::asset('images/signup.png') }}" alt="راحت فود ثبت نام" width="100px" height="100px">
	<h4 style="color:#7f8c8d;">ثبت نام در راحت فود</h4>
	<form action="{{url('/register')}}" method="post" class="auth-form">
		{{ csrf_field() }}
		<div class="form-group {{ $errors->has('name') ? ' has-error' : '' }}">
			<input type="text" name="name" class="form-control input-lg {{ $errors->has('name') ? ' has-error' : '' }}" placeholder="نام و نام خانوادگی" required value="{{old('name')}}"/>
			@if ($errors->has('name'))
				<div class="auth-notifier">{{ $errors->first('name') }}</div>
			@endif	
		</div>
		<div class="form-group {{ $errors->has('phone') ? ' has-error' : '' }}">
			<input type="text" name="phone" class="form-control input-lg {{ $errors->has('phone') ? ' has-error' : '' }}" placeholder="تلفن همراه" required value="{{old('phone')}}"/>
			@if ($errors->has('phone'))
				<div class="auth-notifier">{{ $errors->first('phone') }}</div>
			@endif
		</div>
		<div class="form-group {{ $errors->has('email') ? ' has-error' : '' }}">
			<input type="text" name="email" class="form-control input-lg {{ $errors->has('email') ? ' has-error' : '' }}" placeholder="ایمیل" required value="{{old('email')}}"/>
			@if ($errors->has('email'))
				<div class="auth-notifier">{{ $errors->first('email') }}</div>
			@endif	
		</div>
		<div class="form-group {{ $errors->has('password') ? ' has-error' : '' }}">
			<input type="password" name="password" class="form-control input-lg {{ $errors->has('password') ? ' has-error' : '' }}" placeholder="رمز عبور" required />
			@if ($errors->has('password'))
				<div class="auth-notifier">{{ $errors->first('password') }}</div>
			@endif
		</div>
		<div class="form-group {{ $errors->has('cpassword') ? ' has-error' : '' }}">
			<input type="password" name="cpassword" class="form-control input-lg {{ $errors->has('cpassword') ? ' has-error' : '' }}" placeholder="تکرار رمز عبور" required />
			@if ($errors->has('cpassword'))
				<div class="auth-notifier">{{ $errors->first('cpassword') }}</div>
			@endif
		</div>
		<h6>با فشردن دکمه ثبت نام، موافقت خود را با <a href="{{url('/info#terms')}}" target="_blank">قوانین و مقررات </a>اعلام مینمایید</h6>
		<input type="submit" class="btn btn-lg btn-success" value="ثبت نام">
	</form>
@endsection
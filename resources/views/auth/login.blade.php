@extends('layouts.auth')
@section('title', '- ورود')

@section('seo')
	<meta name="description" content="ورود به حساب کاربری در راحت فود">
	<meta name="keywords" content="راحت فود - ورود">
@endsection

@section('content')
	<img src="{{ URL::asset('images/signin.png') }}" alt="راحت فود ورود" width="100" height="100">
	<h4 style="color:#7f8c8d;">ورود به حساب کاربری</h4>
	<form action="{{url('/login')}}" method="post" class="auth-form">
		{{ csrf_field() }}
		<div class="form-group {{ $errors->has('email') ? ' has-error' : '' }}">
			<input type="text" name="email" class="form-control input-lg" placeholder="ایمیل" required value="{{old('email')}}"/>
			@if ($errors->has('email'))
				<div class="auth-notifier">{{ $errors->first('email') }}</div>
			@endif	
		</div>
		<div class="form-group {{ $errors->has('password') ? ' has-error' : '' }}">
			<input type="password" name="password" class="form-control input-lg {{ $errors->has('password') ? ' has-error' : '' }}" placeholder="رمز عبور" required>
			@if ($errors->has('password'))
				<div class="auth-notifier">{{ $errors->first('password') }}</div>
			@endif
		</div>
		<input type="submit" class="btn btn-lg btn-danger" value="ورود">
	</form>
	<br>
	<h6><a href="{{ url('/password/reset') }}">رمز عبور خود را فراموش کرده اید؟</a></h6>
	<hr>				
	<h6>هنوز ثبت نام نکرده اید؟ از لینک زیر استفاده کنید</h6>
	<div class="auth-form">
		<a href="{{url('/register')}}"><div class="btn btn-lg btn-success">ثبت نام</div></a>
	</div>
	@if (Session::has('message'))
		<p>{{ Session::get('message') }}</p>
	@endif	
@endsection
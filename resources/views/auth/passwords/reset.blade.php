@extends('layouts.auth')
@section('title', 'بازنشانی رمزعبور')
@section('content')
	<h4 style="color:#7f8c8d;">بازنشانی رمز عبور</h4>
	<form action="{{url('/password/reset')}}" method="post" class="auth-form">
		{{ csrf_field() }}
		<input type="hidden" name="token" value="{{ $token }}">
		<div class="form-group {{ $errors->has('email') ? ' has-error' : '' }}">
			<input type="text" name="email" class="form-control input-lg {{ $errors->has('email') ? ' has-error' : '' }}" placeholder="ایمیل" required value="{{old('email')}}"/>
			@if ($errors->has('email'))
				<div class="auth-notifier">{{ $errors->first('email') }}</div>
			@endif
		</div>
		<div class="form-group {{ $errors->has('password') ? ' has-error' : '' }}">
			<input type="password" name="password" id="password" class="form-control input-lg {{ $errors->has('password') ? ' has-error' : '' }}" placeholder="رمز عبور جدید" required />
			@if ($errors->has('password'))
				<div class="auth-notifier">{{ $errors->first('password') }}</div>
			@endif
		</div>
		<div class="form-group {{ $errors->has('password_confirmation') ? ' has-error' : '' }}">
			<input type="password" name="password_confirmation" id="password_confirmation" class="form-control input-lg {{ $errors->has('password_confirmation') ? ' has-error' : '' }}" placeholder="تکرار رمز عبور جدید" required />
			@if ($errors->has('password'))
				<div class="auth-notifier">{{ $errors->first('password_confirmation') }}</div>
			@endif	
		</div>
		<input type="submit" class="btn btn-lg btn-success" value="به روز رسانی رمز عبور" />
	</form>
	@if (session('status'))
		<div style="padding:25px;">
			<div class="alert alert-success well-sm">
				{{ session('status') }}
			</div>
		</div>
	@endif
@endsection
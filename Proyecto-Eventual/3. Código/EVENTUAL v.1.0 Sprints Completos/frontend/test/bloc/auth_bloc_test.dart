import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:app_eventual/features/auth/domain/entities/user_entity.dart';
import 'package:app_eventual/features/auth/domain/repositories/auth_repository.dart';
import 'package:app_eventual/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:app_eventual/core/errors/failures.dart';
import '../helpers/test_setup.dart';

void main() {
  late MockAuthRepository mockRepository;

  setUp(() {
    mockRepository = MockAuthRepository();
    when(() => mockRepository.logout()).thenAnswer((_) async {});
  });

  group('AuthBloc', () {
    blocTest<AuthBloc, AuthState>('emits [Loading, Authenticated] on login success',
      build: () {
        when(() => mockRepository.login(cedula: any(named: 'cedula'), password: any(named: 'password')))
            .thenAnswer((_) async => (user: tUser, failure: null));
        return AuthBloc(mockRepository);
      },
      act: (bloc) => bloc.add(AuthLoginRequested('1234567890', 'pass1234')),
      expect: () => [isA<AuthLoading>(), isA<AuthAuthenticated>()],
    );

    blocTest<AuthBloc, AuthState>('emits [Loading, AuthError] on login failure',
      build: () {
        when(() => mockRepository.login(cedula: any(named: 'cedula'), password: any(named: 'password')))
            .thenAnswer((_) async => (user: tUser, failure: tFailure));
        return AuthBloc(mockRepository);
      },
      act: (bloc) => bloc.add(AuthLoginRequested('0000000000', 'wrong')),
      expect: () => [isA<AuthLoading>(), isA<AuthError>()],
    );

    blocTest<AuthBloc, AuthState>('emits [Loading, AuthBlocked] on blocked account',
      build: () {
        when(() => mockRepository.login(cedula: any(named: 'cedula'), password: any(named: 'password')))
            .thenAnswer((_) async => (user: tUser, failure: tBlockedFailure));
        return AuthBloc(mockRepository);
      },
      act: (bloc) => bloc.add(AuthLoginRequested('1111111111', 'wrong')),
      expect: () => [isA<AuthLoading>(), isA<AuthBlocked>()],
    );

    blocTest<AuthBloc, AuthState>('emits [AuthAuthenticated] when stored user exists',
      build: () {
        when(() => mockRepository.getStoredUser()).thenAnswer((_) async => tUser);
        return AuthBloc(mockRepository);
      },
      act: (bloc) => bloc.add(AuthCheckRequested()),
      expect: () => [isA<AuthAuthenticated>()],
    );

    blocTest<AuthBloc, AuthState>('emits [AuthUnauthenticated] when no stored user',
      build: () {
        when(() => mockRepository.getStoredUser()).thenAnswer((_) async => null);
        return AuthBloc(mockRepository);
      },
      act: (bloc) => bloc.add(AuthCheckRequested()),
      expect: () => [isA<AuthUnauthenticated>()],
    );

    blocTest<AuthBloc, AuthState>('emits [AuthUnauthenticated] on logout',
      build: () => AuthBloc(mockRepository),
      seed: () => AuthAuthenticated(tUser),
      act: (bloc) => bloc.add(AuthLogoutRequested()),
      expect: () => [isA<AuthUnauthenticated>()],
    );
  });
}

import 'package:mocktail/mocktail.dart';
import 'package:app_eventual/core/network/api_client.dart';
import 'package:app_eventual/features/auth/domain/repositories/auth_repository.dart';
import 'package:app_eventual/core/errors/failures.dart';
import 'package:app_eventual/features/auth/domain/entities/user_entity.dart';

class MockApiClient extends Mock implements ApiClient {}

class MockAuthRepository extends Mock implements AuthRepository {}

final tUser = UserEntity(
  id: '1',
  nombres: 'Juan',
  apellidos: 'Pérez',
  cedula: '1234567890',
  rol: 'Socio',
  token: 'test-token',
);

final tFailure = AuthFailure('Credenciales inválidas');
final tBlockedFailure = AuthFailure('Cuenta bloqueada');

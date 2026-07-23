import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:app_eventual/features/members/presentation/bloc/members_bloc.dart';
import 'package:app_eventual/core/constants/api_constants.dart';
import '../helpers/test_setup.dart';

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
  });

  group('MembersBloc', () {
    final tMembersJson = {'members': [
      {'id': '1', 'cedula': '1234567890', 'nombres': 'Juan', 'apellidos': 'Pérez', 'estado': 'Activo', 'rol_id': 3, 'rol_nombre': 'Socio', 'fecha_ingreso': '2026-01-01'},
    ]};

    blocTest<MembersBloc, MembersState>('emits [Loading, MembersLoaded] on load',
      build: () {
        when(() => mockApi.get(ApiConstants.members)).thenAnswer((_) async => tMembersJson);
        return MembersBloc(mockApi);
      },
      act: (bloc) => bloc.add(MembersLoadRequested()),
      expect: () => [isA<MembersLoading>(), isA<MembersLoaded>()],
    );

    blocTest<MembersBloc, MembersState>('emits [Loading, MembersLoaded] with empty list',
      build: () {
        when(() => mockApi.get(ApiConstants.members)).thenAnswer((_) async => {'members': []});
        return MembersBloc(mockApi);
      },
      act: (bloc) => bloc.add(MembersLoadRequested()),
      expect: () => [isA<MembersLoading>(), isA<MembersLoaded>()],
    );

    blocTest<MembersBloc, MembersState>('emits MembersOperationSuccess on create',
      build: () {
        when(() => mockApi.post(ApiConstants.members, any())).thenAnswer((_) async => {'message': 'Creado'});
        when(() => mockApi.get(ApiConstants.members)).thenAnswer((_) async => {'members': []});
        return MembersBloc(mockApi);
      },
      act: (bloc) => bloc.add(MemberCreateRequested({'cedula': '9999999999', 'nombres': 'Nuevo', 'email': 'nuevo@test.com', 'password': 'password123', 'rol_id': 3})),
      expect: () => [isA<MembersLoading>(), isA<MembersOperationSuccess>(), isA<MembersLoading>(), isA<MembersLoaded>()],
    );

    blocTest<MembersBloc, MembersState>('emits MembersOperationSuccess on update',
      build: () {
        when(() => mockApi.put('${ApiConstants.members}/1', any())).thenAnswer((_) async => {'message': 'Actualizado', 'member': {}});
        when(() => mockApi.get(ApiConstants.members)).thenAnswer((_) async => {'members': []});
        return MembersBloc(mockApi);
      },
      act: (bloc) => bloc.add(MemberUpdateRequested('1', {'nombres': 'Nuevo'})),
      expect: () => [isA<MembersLoading>(), isA<MembersOperationSuccess>(), isA<MembersLoading>(), isA<MembersLoaded>()],
    );

    blocTest<MembersBloc, MembersState>('emits MembersOperationSuccess on assign role',
      build: () {
        when(() => mockApi.patch('${ApiConstants.members}/1/role', body: any(named: 'body'))).thenAnswer((_) async => {'message': 'Rol asignado', 'member': {}});
        when(() => mockApi.get(ApiConstants.members)).thenAnswer((_) async => {'members': []});
        return MembersBloc(mockApi);
      },
      act: (bloc) => bloc.add(MemberAssignRoleRequested('1', 1)),
      expect: () => [isA<MembersLoading>(), isA<MembersOperationSuccess>(), isA<MembersLoading>(), isA<MembersLoaded>()],
    );

    blocTest<MembersBloc, MembersState>('emits MembersOperationSuccess on deactivate',
      build: () {
        when(() => mockApi.patch('${ApiConstants.members}/1/deactivate')).thenAnswer((_) async => {'message': 'Desactivado'});
        when(() => mockApi.get(ApiConstants.members)).thenAnswer((_) async => {'members': []});
        return MembersBloc(mockApi);
      },
      act: (bloc) => bloc.add(MemberDeactivateRequested('1')),
      expect: () => [isA<MembersLoading>(), isA<MembersOperationSuccess>(), isA<MembersLoading>(), isA<MembersLoaded>()],
    );
  });
}

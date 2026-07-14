import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:app_eventual/features/execute_event/presentation/bloc/execute_event_bloc.dart';
import '../helpers/test_setup.dart';

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
  });

  group('ExecuteEventBloc', () {
    blocTest('emits [Loading, ExecuteEventActiveLoaded] on load active',
      build: () {
        when(() => mockApi.get('/execute-event/active')).thenAnswer((_) async => {'eventos': [{'id': '1', 'nombre': 'Fiesta', 'estado': 'Registrado'}]});
        return ExecuteEventBloc(mockApi);
      },
      act: (bloc) => bloc.add(ExecuteEventLoadActive()),
      expect: () => [isA<ExecuteEventLoading>(), isA<ExecuteEventActiveLoaded>()],
    );

    blocTest('emits [Loading, ExecuteEventListLoaded] on load list',
      build: () {
        when(() => mockApi.get('/execute-event/1/attendance-list')).thenAnswer((_) async => {'confirmados': [], 'no_confirmados': [], 'total_presentes': 0, 'total_confirmados': 0});
        return ExecuteEventBloc(mockApi);
      },
      act: (bloc) => bloc.add(ExecuteEventLoadList('1')),
      expect: () => [isA<ExecuteEventLoading>(), isA<ExecuteEventListLoaded>()],
    );

    blocTest('emits [Loading, ExecuteEventAttendanceSuccess] on register attendance',
      build: () {
        when(() => mockApi.post('/execute-event/1/register-attendance', any())).thenAnswer((_) async => {'message': 'Asistencia registrada', 'total_presentes': 1});
        return ExecuteEventBloc(mockApi);
      },
      act: (bloc) => bloc.add(ExecuteEventRegisterAttendance(eventoId: '1', socioId: '1')),
      expect: () => [isA<ExecuteEventLoading>(), isA<ExecuteEventAttendanceSuccess>()],
    );

    blocTest('emits [Loading, ExecuteEventCloseSuccess] on close',
      build: () {
        when(() => mockApi.patch('/execute-event/1/close')).thenAnswer((_) async => {'message': 'Evento cerrado', 'tasa_participacion': 80.0});
        return ExecuteEventBloc(mockApi);
      },
      act: (bloc) => bloc.add(ExecuteEventClose('1')),
      expect: () => [isA<ExecuteEventLoading>(), isA<ExecuteEventCloseSuccess>()],
    );

    blocTest('emits [Loading, ExecuteEventFailure] on load active error',
      build: () {
        when(() => mockApi.get('/execute-event/active')).thenThrow(Exception('Sin conexión'));
        return ExecuteEventBloc(mockApi);
      },
      act: (bloc) => bloc.add(ExecuteEventLoadActive()),
      expect: () => [isA<ExecuteEventLoading>(), isA<ExecuteEventFailure>()],
    );

    blocTest('emits [Loading, ExecuteEventFailure] on close error',
      build: () {
        when(() => mockApi.patch('/execute-event/999/close')).thenThrow(Exception('Sin asistentes'));
        return ExecuteEventBloc(mockApi);
      },
      act: (bloc) => bloc.add(ExecuteEventClose('999')),
      expect: () => [isA<ExecuteEventLoading>(), isA<ExecuteEventFailure>()],
    );
  });
}

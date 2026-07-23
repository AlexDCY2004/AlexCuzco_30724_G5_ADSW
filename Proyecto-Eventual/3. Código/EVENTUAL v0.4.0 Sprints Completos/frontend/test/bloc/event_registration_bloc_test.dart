import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:app_eventual/features/event_registration/presentation/bloc/event_registration_bloc.dart';
import '../helpers/test_setup.dart';

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
  });

  group('EventRegistrationBloc', () {
    blocTest<EventRegistrationBloc, EventRegistrationState>('emits [Loading, EventRegistrationSuccess] on register',
      build: () {
        when(() => mockApi.patch('/events/1/register')).thenAnswer((_) async => {'message': 'Registrado', 'codigo_evento': 'EVT-001'});
        return EventRegistrationBloc(mockApi);
      },
      act: (bloc) => bloc.add(EventRegistrationRequested('1')),
      expect: () => [isA<EventRegistrationLoading>(), isA<EventRegistrationSuccess>()],
    );

    blocTest<EventRegistrationBloc, EventRegistrationState>('emits [Loading, EventRegistrationSuccess] with empty codigo_evento',
      build: () {
        when(() => mockApi.patch('/events/1/register')).thenAnswer((_) async => {'message': 'Registrado'});
        return EventRegistrationBloc(mockApi);
      },
      act: (bloc) => bloc.add(EventRegistrationRequested('1')),
      expect: () => [isA<EventRegistrationLoading>(), isA<EventRegistrationSuccess>()],
    );

    blocTest<EventRegistrationBloc, EventRegistrationState>('emits [Loading, EventRegistrationFailure] on invalid state',
      build: () {
        when(() => mockApi.patch('/events/2/register')).thenThrow(Exception('El evento no está en estado Definido'));
        return EventRegistrationBloc(mockApi);
      },
      act: (bloc) => bloc.add(EventRegistrationRequested('2')),
      expect: () => [isA<EventRegistrationLoading>(), isA<EventRegistrationFailure>()],
    );

    blocTest<EventRegistrationBloc, EventRegistrationState>('emits [Loading, EventRegistrationFailure] on not found',
      build: () {
        when(() => mockApi.patch('/events/999/register')).thenThrow(Exception('Evento no encontrado'));
        return EventRegistrationBloc(mockApi);
      },
      act: (bloc) => bloc.add(EventRegistrationRequested('999')),
      expect: () => [isA<EventRegistrationLoading>(), isA<EventRegistrationFailure>()],
    );

    blocTest<EventRegistrationBloc, EventRegistrationState>('emits [Loading, EventRegistrationFailure] on network error',
      build: () {
        when(() => mockApi.patch('/events/1/register')).thenThrow(Exception('Sin conexión'));
        return EventRegistrationBloc(mockApi);
      },
      act: (bloc) => bloc.add(EventRegistrationRequested('1')),
      expect: () => [isA<EventRegistrationLoading>(), isA<EventRegistrationFailure>()],
    );
  });
}

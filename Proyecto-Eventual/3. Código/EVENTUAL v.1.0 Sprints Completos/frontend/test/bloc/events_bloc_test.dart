import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:app_eventual/features/events/presentation/bloc/events_bloc.dart';
import 'package:app_eventual/core/constants/api_constants.dart';
import 'package:app_eventual/core/utils/strategy.dart';
import '../helpers/test_setup.dart';

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
  });

  group('EventsBloc', () {
    final tEventJson = {'id': '1', 'nombre': 'Fiesta', 'tipo_evento': 'Social', 'descripcion': 'Desc', 'fecha': '2026-06-15', 'hora': '18:00', 'lugar': 'Salón', 'estado': 'Registrado'};

    blocTest<EventsBloc, EventsState>('emits [Loading, EventsLoaded] on load',
      build: () {
        when(() => mockApi.get(ApiConstants.events)).thenAnswer((_) async => {'eventos': [tEventJson]});
        return EventsBloc(mockApi);
      },
      act: (bloc) => bloc.add(EventsLoadRequested()),
      expect: () => [isA<EventsLoading>(), isA<EventsLoaded>()],
    );

    blocTest<EventsBloc, EventsState>('emits [Loading, EventsEmpty] when no events',
      build: () {
        when(() => mockApi.get(ApiConstants.events)).thenAnswer((_) async => {'eventos': []});
        return EventsBloc(mockApi);
      },
      act: (bloc) => bloc.add(EventsLoadRequested()),
      expect: () => [isA<EventsLoading>(), isA<EventsEmpty>()],
    );

    blocTest<EventsBloc, EventsState>('emits [Loading, EventsLoaded] on filter changed',
      build: () {
        when(() => mockApi.get(any())).thenAnswer((_) async => {'eventos': [tEventJson]});
        return EventsBloc(mockApi);
      },
      act: (bloc) => bloc.add(EventsFilterChanged(const FilterByTypeStrategy('Social'))),
      expect: () => [isA<EventsLoading>(), isA<EventsLoaded>()],
    );

    blocTest<EventsBloc, EventsState>('emits [Loading, EventDetailLoaded] on detail request',
      build: () {
        when(() => mockApi.get('${ApiConstants.events}/1')).thenAnswer((_) async => {'evento': tEventJson});
        return EventsBloc(mockApi);
      },
      act: (bloc) => bloc.add(EventsDetailRequested('1')),
      expect: () => [isA<EventsLoading>(), isA<EventDetailLoaded>()],
    );

    blocTest<EventsBloc, EventsState>('emits [Loading, EventsError] on detail not found',
      build: () {
        when(() => mockApi.get('${ApiConstants.events}/999')).thenThrow(Exception('Not found'));
        return EventsBloc(mockApi);
      },
      act: (bloc) => bloc.add(EventsDetailRequested('999')),
      expect: () => [isA<EventsLoading>(), isA<EventsError>()],
    );

    blocTest<EventsBloc, EventsState>('emits [Loading, EventsError] on network error',
      build: () {
        when(() => mockApi.get(ApiConstants.events)).thenThrow(Exception('Sin conexión'));
        return EventsBloc(mockApi);
      },
      act: (bloc) => bloc.add(EventsLoadRequested()),
      expect: () => [isA<EventsLoading>(), isA<EventsError>()],
    );
  });
}

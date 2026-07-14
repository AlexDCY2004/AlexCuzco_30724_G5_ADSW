import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:app_eventual/features/broadcast/presentation/bloc/broadcast_bloc.dart';
import '../helpers/test_setup.dart';

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
  });

  group('BroadcastBloc', () {
    blocTest<BroadcastBloc, BroadcastState>('emits [Loading, BroadcastEventsLoaded] on load events',
      build: () {
        when(() => mockApi.get('/broadcast/events')).thenAnswer((_) async => {'eventos': [{'id': '1', 'nombre': 'Fiesta', 'estado': 'Difundido'}]});
        return BroadcastBloc(mockApi);
      },
      act: (bloc) => bloc.add(BroadcastLoadEvents()),
      expect: () => [isA<BroadcastLoading>(), isA<BroadcastEventsLoaded>()],
    );

    blocTest<BroadcastBloc, BroadcastState>('emits [Loading, BroadcastTemplateLoaded] on load template',
      build: () {
        when(() => mockApi.get('/broadcast/events/1/template')).thenAnswer((_) async => {'plantilla': 'Template', 'evento': {'id': '1', 'nombre': 'Fiesta'}});
        return BroadcastBloc(mockApi);
      },
      act: (bloc) => bloc.add(BroadcastLoadTemplate('1')),
      expect: () => [isA<BroadcastLoading>(), isA<BroadcastTemplateLoaded>()],
    );

    blocTest<BroadcastBloc, BroadcastState>('emits [Loading, BroadcastSuccess] on submit',
      build: () {
        when(() => mockApi.post('/broadcast', any())).thenAnswer((_) async => {'message': 'Difundido', 'socios_notificados': 50});
        return BroadcastBloc(mockApi);
      },
      act: (bloc) => bloc.add(BroadcastSubmitted(eventoId: '1', mensaje: 'Confirmado', canales: ['app'], esInmediata: true, recordatorios: [])),
      expect: () => [isA<BroadcastLoading>(), isA<BroadcastSuccess>()],
    );

    blocTest<BroadcastBloc, BroadcastState>('emits [Loading, BroadcastFailure] on submit error',
      build: () {
        when(() => mockApi.post('/broadcast', any())).thenThrow(Exception('Evento no encontrado'));
        return BroadcastBloc(mockApi);
      },
      act: (bloc) => bloc.add(BroadcastSubmitted(eventoId: '999', mensaje: 'Test', canales: ['app'], esInmediata: true, recordatorios: [])),
      expect: () => [isA<BroadcastLoading>(), isA<BroadcastFailure>()],
    );

    blocTest<BroadcastBloc, BroadcastState>('emits [Loading, BroadcastFailure] on load events error',
      build: () {
        when(() => mockApi.get('/broadcast/events')).thenThrow(Exception('Sin conexión'));
        return BroadcastBloc(mockApi);
      },
      act: (bloc) => bloc.add(BroadcastLoadEvents()),
      expect: () => [isA<BroadcastLoading>(), isA<BroadcastFailure>()],
    );
  });
}

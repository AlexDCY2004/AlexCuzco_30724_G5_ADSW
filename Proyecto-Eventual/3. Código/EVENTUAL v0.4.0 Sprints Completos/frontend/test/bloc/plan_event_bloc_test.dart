import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:app_eventual/features/plan_event/presentation/bloc/plan_event_bloc.dart';
import '../helpers/test_setup.dart';

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
  });

  group('PlanEventBloc', () {
    blocTest('emits [Loading, PlanEventProposalsLoaded] on load',
      build: () {
        when(() => mockApi.get('/plan-event/proposals')).thenAnswer((_) async => {'propuestas': [{'id': '1', 'tipo_evento': 'Social', 'descripcion': 'Desc', 'estado': 'Pendiente'}]});
        return PlanEventBloc(mockApi);
      },
      act: (bloc) => bloc.add(PlanEventLoadProposals()),
      expect: () => [isA<PlanEventLoading>(), isA<PlanEventProposalsLoaded>()],
    );

    blocTest('emits [Loading, PlanEventSuccess] on approve',
      build: () {
        when(() => mockApi.post('/plan-event/approve/1', any())).thenAnswer((_) async => {'message': 'Evento definido'});
        return PlanEventBloc(mockApi);
      },
      act: (bloc) => bloc.add(PlanEventApprove(propuestaId: '1', fecha: '2026-12-25', hora: '18:00', lugar: 'Salón')),
      expect: () => [isA<PlanEventLoading>(), isA<PlanEventSuccess>()],
    );

    blocTest('emits [Loading, PlanEventSuccess] on reject',
      build: () {
        when(() => mockApi.post('/plan-event/reject/1', any())).thenAnswer((_) async => {'message': 'Propuesta rechazada'});
        return PlanEventBloc(mockApi);
      },
      act: (bloc) => bloc.add(PlanEventReject('1')),
      expect: () => [isA<PlanEventLoading>(), isA<PlanEventSuccess>()],
    );

    blocTest('emits [Loading, PlanEventFailure] on load error',
      build: () {
        when(() => mockApi.get('/plan-event/proposals')).thenThrow(Exception('Sin conexión'));
        return PlanEventBloc(mockApi);
      },
      act: (bloc) => bloc.add(PlanEventLoadProposals()),
      expect: () => [isA<PlanEventLoading>(), isA<PlanEventFailure>()],
    );

    blocTest('emits [Loading, PlanEventFailure] on approve error',
      build: () {
        when(() => mockApi.post('/plan-event/approve/1', any())).thenThrow(Exception('Conflicto'));
        return PlanEventBloc(mockApi);
      },
      act: (bloc) => bloc.add(PlanEventApprove(propuestaId: '1', fecha: '2026-12-25', hora: '18:00', lugar: 'Salón')),
      expect: () => [isA<PlanEventLoading>(), isA<PlanEventFailure>()],
    );
  });
}

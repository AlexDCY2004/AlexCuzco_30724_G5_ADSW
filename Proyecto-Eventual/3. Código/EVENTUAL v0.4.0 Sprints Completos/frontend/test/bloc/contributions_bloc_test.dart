import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:app_eventual/features/contributions/presentation/bloc/contributions_bloc.dart';
import '../helpers/test_setup.dart';

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
  });

  group('ContributionsBloc', () {
    blocTest<ContributionsBloc, ContributionsState>('emits [Loading, ContributionsLoaded] on load pending',
      build: () {
        when(() => mockApi.get('/contributions/pending')).thenAnswer((_) async => {'pendientes': [{'id': '1', 'cedula': '123', 'nombres': 'A', 'apellidos': 'B'}], 'cuota_estandar': 20, 'periodo': '2026-07'});
        return ContributionsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ContributionsPendingRequested()),
      expect: () => [isA<ContributionsLoading>(), isA<ContributionsLoaded>()],
    );

    blocTest<ContributionsBloc, ContributionsState>('emits [Loading, ContributionsLoaded] with empty list',
      build: () {
        when(() => mockApi.get('/contributions/pending')).thenAnswer((_) async => {'pendientes': [], 'cuota_estandar': 20, 'periodo': '2026-07'});
        return ContributionsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ContributionsPendingRequested()),
      expect: () => [isA<ContributionsLoading>(), isA<ContributionsLoaded>()],
    );

    blocTest<ContributionsBloc, ContributionsState>('emits [Loading, ContributionSuccess] on submit',
      build: () {
        when(() => mockApi.post('/contributions', any())).thenAnswer((_) async => {'message': 'Aporte registrado'});
        return ContributionsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ContributionSubmitted(socioId: '1', metodoPago: 'Efectivo', monto: 20, fechaPago: '2026-07-01', estado: 'Validado')),
      expect: () => [isA<ContributionsLoading>(), isA<ContributionSuccess>()],
    );

    blocTest<ContributionsBloc, ContributionsState>('emits [Loading, ContributionFailure] on submit error',
      build: () {
        when(() => mockApi.post('/contributions', any())).thenThrow(Exception('Monto mínimo no cumplido'));
        return ContributionsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ContributionSubmitted(socioId: '1', metodoPago: 'Efectivo', monto: 5, fechaPago: '2026-07-01', estado: 'Validado')),
      expect: () => [isA<ContributionsLoading>(), isA<ContributionFailure>()],
    );

    blocTest<ContributionsBloc, ContributionsState>('emits [Loading, ContributionFailure] on load error',
      build: () {
        when(() => mockApi.get('/contributions/pending')).thenThrow(Exception('Sin conexión'));
        return ContributionsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ContributionsPendingRequested()),
      expect: () => [isA<ContributionsLoading>(), isA<ContributionFailure>()],
    );
  });
}

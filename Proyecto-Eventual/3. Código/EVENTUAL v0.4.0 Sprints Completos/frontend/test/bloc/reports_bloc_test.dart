import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:app_eventual/features/reports/presentation/bloc/reports_bloc.dart';
import '../helpers/test_setup.dart';

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
  });

  group('ReportsBloc', () {
    blocTest('emits [Loading, ReportsParticipationLoaded] on participation report',
      build: () {
        when(() => mockApi.get(any())).thenAnswer((_) async => {'eventos': [{'id': '1', 'nombre': 'Fiesta'}], 'resumen': {'total': 1}});
        return ReportsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ReportsGenerateParticipation()),
      expect: () => [isA<ReportsLoading>(), isA<ReportsParticipationLoaded>()],
    );

    blocTest('emits [Loading, ReportsHistoryLoaded] on history report',
      build: () {
        when(() => mockApi.get(any())).thenAnswer((_) async => {'eventos': [{'id': '1', 'nombre': 'Fiesta', 'estado': 'Cerrado'}], 'firmante': 'Juan Pérez'});
        return ReportsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ReportsGenerateHistory()),
      expect: () => [isA<ReportsLoading>(), isA<ReportsHistoryLoaded>()],
    );

    blocTest('emits [Loading, ReportsLiquidationsLoaded] on liquidations report',
      build: () {
        when(() => mockApi.get(any())).thenAnswer((_) async => {'liquidaciones': [{'id': '1'}], 'resumen': {'total_gastos': 300}});
        return ReportsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ReportsGenerateLiquidations()),
      expect: () => [isA<ReportsLoading>(), isA<ReportsLiquidationsLoaded>()],
    );

    blocTest('emits [Loading, ReportsParticipationLoaded] with empty data',
      build: () {
        when(() => mockApi.get(any())).thenAnswer((_) async => {'eventos': []});
        return ReportsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ReportsGenerateParticipation()),
      expect: () => [isA<ReportsLoading>(), isA<ReportsParticipationLoaded>()],
    );

    blocTest('emits [Loading, ReportsHistoryLoaded] with empty eventos',
      build: () {
        when(() => mockApi.get(any())).thenAnswer((_) async => {'eventos': []});
        return ReportsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ReportsGenerateHistory()),
      expect: () => [isA<ReportsLoading>(), isA<ReportsHistoryLoaded>()],
    );

    blocTest('emits [Loading, ReportsFailure] on error',
      build: () {
        when(() => mockApi.get(any())).thenThrow(Exception('Error del servidor'));
        return ReportsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ReportsGenerateParticipation()),
      expect: () => [isA<ReportsLoading>(), isA<ReportsFailure>()],
    );
  });
}

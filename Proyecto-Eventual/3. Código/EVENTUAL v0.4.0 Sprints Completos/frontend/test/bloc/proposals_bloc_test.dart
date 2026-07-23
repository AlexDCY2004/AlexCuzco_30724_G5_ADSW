import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:app_eventual/features/proposals/presentation/bloc/proposals_bloc.dart';
import 'package:app_eventual/core/constants/api_constants.dart';
import '../helpers/test_setup.dart';

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
  });

  group('ProposalsBloc', () {
    final tProposalJson = {'id': '1', 'tipo_evento': 'Social', 'descripcion': 'Desc larga', 'fecha_sugerida': '2026-12-25', 'justificacion': 'Just', 'estado': 'Pendiente', 'numero_seguimiento': 'PROP-001', 'fecha_registro': '2026-06-01'};

    blocTest<ProposalsBloc, ProposalsState>('emits [Loading, ProposalsLoaded] on load mine',
      build: () {
        when(() => mockApi.get(ApiConstants.myProposals)).thenAnswer((_) async => {'propuestas': [tProposalJson]});
        return ProposalsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ProposalsLoadMine()),
      expect: () => [isA<ProposalsLoading>(), isA<ProposalsLoaded>()],
    );

    blocTest<ProposalsBloc, ProposalsState>('emits [Loading, ProposalsLoaded] with empty list',
      build: () {
        when(() => mockApi.get(ApiConstants.myProposals)).thenAnswer((_) async => {'propuestas': []});
        return ProposalsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ProposalsLoadMine()),
      expect: () => [isA<ProposalsLoading>(), isA<ProposalsLoaded>()],
    );

    blocTest<ProposalsBloc, ProposalsState>('emits [Loading, ProposalSubmitSuccess] on submit',
      build: () {
        when(() => mockApi.post(ApiConstants.proposals, any())).thenAnswer((_) async => {'message': 'Propuesta registrada', 'propuesta': tProposalJson});
        return ProposalsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ProposalSubmitRequested(tipoEvento: 'Social', descripcion: 'X' * 51, fechaSugerida: '2026-12-25', justificacion: 'Fiesta')),
      expect: () => [isA<ProposalsLoading>(), isA<ProposalSubmitSuccess>()],
    );

    blocTest<ProposalsBloc, ProposalsState>('emits [Loading, ProposalsError] on submit failure',
      build: () {
        when(() => mockApi.post(ApiConstants.proposals, any())).thenThrow(Exception('Error de validación'));
        return ProposalsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ProposalSubmitRequested(tipoEvento: 'Social', descripcion: '', fechaSugerida: '', justificacion: '')),
      expect: () => [isA<ProposalsLoading>(), isA<ProposalsError>()],
    );

    blocTest<ProposalsBloc, ProposalsState>('emits [Loading, ProposalsError] on load error',
      build: () {
        when(() => mockApi.get(ApiConstants.myProposals)).thenThrow(Exception('Sin conexión'));
        return ProposalsBloc(mockApi);
      },
      act: (bloc) => bloc.add(ProposalsLoadMine()),
      expect: () => [isA<ProposalsLoading>(), isA<ProposalsError>()],
    );
  });
}

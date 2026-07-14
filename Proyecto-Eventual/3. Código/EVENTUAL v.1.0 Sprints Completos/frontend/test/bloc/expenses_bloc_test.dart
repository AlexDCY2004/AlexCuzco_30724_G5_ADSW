import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:app_eventual/features/expenses/presentation/bloc/expenses_bloc.dart';
import '../helpers/test_setup.dart';

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
  });

  group('ExpensesBloc', () {
    blocTest<ExpensesBloc, ExpensesState>('emits [Loading, ExpensesLoaded] on load',
      build: () {
        when(() => mockApi.get('/expenses/1')).thenAnswer((_) async => {'gastos': [{'id': 1, 'categoria': 'Sonido', 'monto': 200}]});
        return ExpensesBloc(mockApi);
      },
      act: (bloc) => bloc.add(ExpensesLoadRequested('1')),
      expect: () => [isA<ExpensesLoading>(), isA<ExpensesLoaded>()],
    );

    blocTest<ExpensesBloc, ExpensesState>('emits [Loading, ExpensesLoaded] with empty list',
      build: () {
        when(() => mockApi.get('/expenses/1')).thenAnswer((_) async => {'gastos': []});
        return ExpensesBloc(mockApi);
      },
      act: (bloc) => bloc.add(ExpensesLoadRequested('1')),
      expect: () => [isA<ExpensesLoading>(), isA<ExpensesLoaded>()],
    );

    blocTest<ExpensesBloc, ExpensesState>('emits [Loading, ExpenseSuccess] on submit',
      build: () {
        when(() => mockApi.post('/expenses', any())).thenAnswer((_) async => {'message': 'Gasto registrado'});
        return ExpensesBloc(mockApi);
      },
      act: (bloc) => bloc.add(ExpenseSubmitted(eventoId: '1', categoria: 'Sonido', monto: 200, fechaGasto: '2026-07-01', metodoPago: 'Efectivo', descripcion: 'Alquiler', responsable: 'Juan')),
      expect: () => [isA<ExpensesLoading>(), isA<ExpenseSuccess>()],
    );

    blocTest<ExpensesBloc, ExpensesState>('emits [Loading, ExpenseFailure] on submit error',
      build: () {
        when(() => mockApi.post('/expenses', any())).thenThrow(Exception('Presupuesto excedido'));
        return ExpensesBloc(mockApi);
      },
      act: (bloc) => bloc.add(ExpenseSubmitted(eventoId: '1', categoria: 'Sonido', monto: 9999, fechaGasto: '2026-07-01', metodoPago: 'Efectivo', descripcion: 'Caro', responsable: 'Juan')),
      expect: () => [isA<ExpensesLoading>(), isA<ExpenseFailure>()],
    );

    blocTest<ExpensesBloc, ExpensesState>('emits [Loading, ExpenseFailure] on load error',
      build: () {
        when(() => mockApi.get('/expenses/999')).thenThrow(Exception('Sin conexión'));
        return ExpensesBloc(mockApi);
      },
      act: (bloc) => bloc.add(ExpensesLoadRequested('999')),
      expect: () => [isA<ExpensesLoading>(), isA<ExpenseFailure>()],
    );
  });
}

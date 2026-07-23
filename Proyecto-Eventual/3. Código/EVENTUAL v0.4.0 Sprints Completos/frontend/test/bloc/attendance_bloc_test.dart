import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:app_eventual/features/attendance/presentation/bloc/attendance_bloc.dart';
import '../helpers/test_setup.dart';

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
  });

  group('AttendanceBloc', () {
    blocTest<AttendanceBloc, AttendanceState>('emits [Loading, AttendanceLoaded] on load',
      build: () {
        when(() => mockApi.get('/attendance/1/mine')).thenAnswer((_) async => {'confirmacion': {'id': 1, 'asiste': true}});
        return AttendanceBloc(mockApi);
      },
      act: (bloc) => bloc.add(AttendanceLoadRequested('1')),
      expect: () => [isA<AttendanceLoading>(), isA<AttendanceLoaded>()],
    );

    blocTest<AttendanceBloc, AttendanceState>('emits [Loading, AttendanceLoaded(null)] when not found',
      build: () {
        when(() => mockApi.get('/attendance/999/mine')).thenAnswer((_) async => {'confirmacion': null});
        return AttendanceBloc(mockApi);
      },
      act: (bloc) => bloc.add(AttendanceLoadRequested('999')),
      expect: () => [isA<AttendanceLoading>(), isA<AttendanceLoaded>()],
    );

    blocTest<AttendanceBloc, AttendanceState>('emits [Loading, AttendanceSuccess] on submit',
      build: () {
        when(() => mockApi.post('/attendance', any())).thenAnswer((_) async => {'message': 'Confirmación registrada'});
        return AttendanceBloc(mockApi);
      },
      act: (bloc) => bloc.add(AttendanceSubmitted(eventoId: '1', asiste: true)),
      expect: () => [isA<AttendanceLoading>(), isA<AttendanceSuccess>()],
    );

    blocTest<AttendanceBloc, AttendanceState>('emits [Loading, AttendanceFailure] on submit error',
      build: () {
        when(() => mockApi.post('/attendance', any())).thenThrow(Exception('Error'));
        return AttendanceBloc(mockApi);
      },
      act: (bloc) => bloc.add(AttendanceSubmitted(eventoId: '999', asiste: true)),
      expect: () => [isA<AttendanceLoading>(), isA<AttendanceFailure>()],
    );

    blocTest<AttendanceBloc, AttendanceState>('emits [Loading, AttendanceLoaded(null)] on load error',
      build: () {
        when(() => mockApi.get('/attendance/1/mine')).thenThrow(Exception('Error'));
        return AttendanceBloc(mockApi);
      },
      act: (bloc) => bloc.add(AttendanceLoadRequested('1')),
      expect: () => [isA<AttendanceLoading>(), isA<AttendanceLoaded>()],
    );
  });
}

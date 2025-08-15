# Git 커밋 히스토리 정리 가이드

개발 중 더러운 커밋들을 깔끔하게 정리하여 오픈소스 공개 준비

## 추천 방법: Soft Reset

### 1. 현재 상태 확인
```bash
git log --oneline
```

### 2. 커밋 정리 (파일은 유지)
```bash
# 최근 N개 커밋 취소 (파일은 그대로)
git reset --soft HEAD~5

# 모든 변경사항이 staged 상태가 됨
git status
```

### 3. 새로운 깔끔한 커밋 생성
```bash
git commit -m "feat: implement feedback SDK v1.0.0

- Add floating feedback widget
- Add settings feedback form  
- Add React SDK with hooks
- Add API server with MongoDB"
```

### 4. 원격저장소에 적용
```bash
git push --force origin main
```

## 결과

**Before:**
```
* e8f9a12 wip: fix bug
* d7c8b11 temp: testing  
* c6b7a10 asdf: random change
* b5a6910 add widget
* a4958f0 initial commit
```

**After:**
```
* f1e2d3c feat: implement feedback SDK v1.0.0
* a4958f0 initial commit
```

## 개발 워크플로우

**개발 중:** 마음껏 더러운 커밋
```bash
git commit -m "wip: stuff"
git commit -m "fix: bug"
git commit -m "temp: test"
```

**공개 전:** 한 번에 정리
```bash
git reset --soft HEAD~N
git commit -m "feat: clean version"
git push --force origin main
```
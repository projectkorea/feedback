# MCP 서버 일괄 설치

## 명령어

```bash
claude mcp list
claude mcp add context7 -- npx -y @upstash/context7-mcp
claude mcp add sequential -- npx -y @modelcontextprotocol/server-sequential-thinking
claude mcp add playwright -- npx -y @playwright/mcp@latest
claude mcp add --transport http figma-dev-mode-mcp-server https://mcp.figma.com/mcp
claude mcp add figma -- npx figma-mcp-server
claude mcp remove playwright
```

## 쓸만한 것

- **Context7**: 라이브러리/프레임워크 실시간 문서, 자주 끊기면 로컬모드로 설치
- **Sequential**: 다단계 추론과 복합 분석  
- **Playwright**: E2E 테스트 및 브라우저 자동화, '서버 사이드에서 돌릴 때 headless 모드로 해줘'
- **Magic**: UI 컴포넌트 자동 생성 (API키 필요)
- **Morphllm**: 대량 코드 변환 (API키 필요)
- **Serena**: 코드 의미 이해 및 세션 지속성

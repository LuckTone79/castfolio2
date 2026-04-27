param (
    [Parameter(Mandatory=$true, HelpMessage="클로드에게 지시할 내용을 입력해주세요 (예: '리팩토링 해줘')")]
    [string]$Prompt
)

# 클로드 코드(Claude Code)를 터미널 종료 후에도 백그라운드에서 지속 실행하도록 해주는 명령어입니다.
# -p (--print) 옵션과 --dangerously-skip-permissions (자동승인 모드) 옵션을 사용합니다.

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$OutputFile = "claude_output_$Timestamp.txt"

Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command `"claude '$Prompt' --dangerously-skip-permissions -p > $OutputFile 2>&1`""

Write-Host "==============================================" -ForegroundColor Green
Write-Host "[성공] 클로드 코드가 백그라운드(자동 승인 모드)로 실행되었습니다!" -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Green
Write-Host "- 지시 내용: $Prompt"
Write-Host "- 기록 파일: $OutputFile"
Write-Host "- 안내: 지금 바로 터미널 창을 닫으셔도 작업은 계속 진행됩니다."
Write-Host "- 확인: 내 폴더에 생성된 $OutputFile 메모장 파일을 열어서 작업 진행 상황을 확인하세요."
Write-Host "==============================================" -ForegroundColor Green

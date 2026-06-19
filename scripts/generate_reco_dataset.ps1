# Generates the Pakistan crop recommendation dataset from documented requirement ranges.
# Method: per crop, sample each feature from a Gaussian(mean, std) truncated (clamped)
# to [min, max]. Ranges in pakistan_crop_requirements.csv are real-measured for 7 crops
# (source=measured) and literature-derived for 8 Pakistani crops (source=literature).
# Seeded for reproducibility.

param(
  [int]$SamplesPerCrop = 150,
  [int]$Seed = 42,
  [string]$ReqPath = "e:\SM\data\pakistan_crop_requirements.csv",
  [string]$OutPath = "e:\SM\data\pakistan_crop_recommendation.csv"
)

Get-Random -SetSeed $Seed | Out-Null
$req = Import-Csv $ReqPath

# Standard normal via Box-Muller using two uniforms in (0,1].
function Get-StdNormal {
  $u1 = (Get-Random -Minimum 1 -Maximum 1000000) / 1000000.0
  $u2 = (Get-Random -Minimum 1 -Maximum 1000000) / 1000000.0
  return [math]::Sqrt(-2.0 * [math]::Log($u1)) * [math]::Cos(2.0 * [math]::PI * $u2)
}

# Sample one truncated-Gaussian value, clamped to [min,max].
function Sample([double]$mean, [double]$std, [double]$lo, [double]$hi) {
  $v = $mean + $std * (Get-StdNormal)
  if ($v -lt $lo) { $v = $lo }
  if ($v -gt $hi) { $v = $hi }
  return $v
}

$rows = New-Object System.Collections.Generic.List[object]
foreach ($c in $req) {
  for ($i = 0; $i -lt $SamplesPerCrop; $i++) {
    $N = [math]::Round((Sample $c.N_mean $c.N_std $c.N_min $c.N_max), 0)
    $P = [math]::Round((Sample $c.P_mean $c.P_std $c.P_min $c.P_max), 0)
    $K = [math]::Round((Sample $c.K_mean $c.K_std $c.K_min $c.K_max), 0)
    $temp = [math]::Round((Sample $c.temp_mean $c.temp_std $c.temp_min $c.temp_max), 2)
    $hum  = [math]::Round((Sample $c.hum_mean $c.hum_std $c.hum_min $c.hum_max), 2)
    $ph   = [math]::Round((Sample $c.ph_mean $c.ph_std $c.ph_min $c.ph_max), 2)
    $rain = [math]::Round((Sample $c.rain_mean $c.rain_std $c.rain_min $c.rain_max), 2)
    $rows.Add([pscustomobject]@{
      N = $N; P = $P; K = $K; temperature = $temp;
      humidity = $hum; ph = $ph; rainfall = $rain; label = $c.crop
    })
  }
}

$rows | Export-Csv -Path $OutPath -NoTypeInformation -Encoding utf8
"Generated $($rows.Count) rows across $($req.Count) crops -> $OutPath"
